import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// --- Types & Interfaces ---

export interface UserMetrics {
  deliverySpeed?: string;
  completionRate?: string;
  revisionRate?: string;
  paymentSpeed?: string;
  scopeCreep?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  profileImage: string;
  bio: string;
  isSuspended: boolean;
  reputationScore: number;
  metrics: UserMetrics;
  createdAt: string;
}

export interface FreelancerProfile {
  id: string;
  fullName: string;
  title: string;
  skills: string[];
  dayRate: number;
  reputationScore: number;
  profileImage: string;
  bio: string;
  completedProjectsCount: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  freelancerId: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  projectId: string;
  message: string;
  type: 'text' | 'file' | 'audio';
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isEnhanced?: boolean;
  originalMessage?: string;
  isFlagged?: boolean;
}

export interface TaskComment {
  id: string;
  userName: string;
  userRole: string;
  profileImage: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'review' | 'completed';
  deadline: string;
  assigneeId?: string;
  comments?: TaskComment[];
}

export interface ProjectFile {
  id: string;
  projectId: string;
  uploadedBy: string;
  url: string;
  name: string;
  type: string;
  size: string;
  timestamp: string;
}

export interface TranslatedBrief {
  id: string;
  projectId: string;
  originalPrompt: string;
  objective: string;
  styleKeywords: string[];
  colors: string[];
  typography: string;
  targetAudience: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  status: 'pending' | 'paid';
  dueDate: string;
  createdAt: string;
}

interface AppContextProps {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  chats: ChatMessage[];
  tasks: Task[];
  files: ProjectFile[];
  briefs: TranslatedBrief[];
  activeProject: Project | null;
  
  // v2.0 additions
  geminiApiKey: string | null;
  invoices: Invoice[];
  freelancersCatalog: FreelancerProfile[];
  saveGeminiApiKey: (key: string | null) => void;
  createInvoice: (title: string, amount: number, dueDate: string) => void;
  payInvoice: (invoiceId: string) => void;

  // v3.0 auth additions
  session: Session | null;
  authLoading: boolean;
  signUpUser: (email: string, password: string, fullName: string, role: 'client' | 'freelancer', bio: string) => Promise<{ error: any }>;
  signInUser: (email: string, password: string) => Promise<{ error: any }>;
  signOutUser: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: any }>;

  // Actions
  switchRole: (role: 'client' | 'freelancer' | 'admin') => void;
  updateProjectStatus: (projectId: string, status: Project['status']) => void;
  sendChatMessage: (message: string, type?: 'text' | 'file' | 'audio', fileUrl?: string, fileName?: string, fileSize?: string) => void;
  enhanceMessage: (messageId: string) => void;
  translateClientBrief: (prompt: string) => Promise<TranslatedBrief>;
  addTask: (title: string, description: string, deadline: string, assigneeId?: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  updateTaskDetails: (taskId: string, updates: Partial<Task>) => void;
  addTaskComment: (taskId: string, text: string) => void;
  uploadProjectFile: (name: string, type: string, size: string, url: string) => void;
  toggleUserSuspension: (userId: string) => void;
  flagMessage: (messageId: string) => void;
  dismissMessageFlag: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  createProject: (title: string, description: string, freelancerId: string, dueDate: string) => Promise<{ error: any }>;
}

// --- Initial Mock Data ---

const mockUsers: User[] = [
  {
    id: 'user-client',
    fullName: 'Sarah Chen',
    email: 'sarah.chen@innovate.co',
    role: 'client',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Founder of Innovate Co. Looking for a modern, luxurious, and youthful brand redesign.',
    isSuspended: false,
    reputationScore: 98,
    metrics: {
      paymentSpeed: 'Instant (Avg 2hr)',
      scopeCreep: 'Minimal (5%)',
      revisionRate: 'Low (1.1 avg)'
    },
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'user-freelancer',
    fullName: 'Alex Rivera',
    email: 'alex.design@freelance.org',
    role: 'freelancer',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Senior Brand Identity Designer & UI/UX Expert. Helping tech-enabled brands stand out.',
    isSuspended: false,
    reputationScore: 95,
    metrics: {
      deliverySpeed: '97% On-Time',
      completionRate: '100% (24/24)',
      revisionRate: '1.2 Avg Cycles'
    },
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'user-admin',
    fullName: 'System Administrator',
    email: 'admin@chatable.app',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Chatable core safety and system monitoring team.',
    isSuspended: false,
    reputationScore: 100,
    metrics: {},
    createdAt: '2026-01-01T08:00:00Z',
  }
];

const mockFreelancersCatalog: FreelancerProfile[] = [
  {
    id: 'f-1',
    fullName: 'David Kojo',
    title: 'Minimalist Vector Illustrator',
    skills: ['Logo Design', 'Vector Illustration', 'SVG Assets', 'Brand Kits'],
    dayRate: 450,
    reputationScore: 98,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Specialist in high-contrast vector illustrations and scalable logo packages. Focused on clean shapes.',
    completedProjectsCount: 38
  },
  {
    id: 'f-2',
    fullName: 'Elena Rostova',
    title: 'Product UI & Dark Mode Architect',
    skills: ['Figma Prototyping', 'Dark UI Systems', 'React Frontends', 'Tailwind CSS'],
    dayRate: 600,
    reputationScore: 96,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Elena is a premium dark mode dashboard developer with extensive experience building UI elements in React and Tailwind.',
    completedProjectsCount: 42
  },
  {
    id: 'f-3',
    fullName: 'Marcus Vane',
    title: 'Brand Copywriter & Tone Strategist',
    skills: ['Copywriting', 'Tone Guidelines', 'Landing Copy', 'SEO Strategy'],
    dayRate: 350,
    reputationScore: 92,
    profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    bio: 'Crafting rich brand voices for SaaS tools and creative services. Focused on high-engagement messaging.',
    completedProjectsCount: 19
  }
];

const mockProjects: Project[] = [
  {
    id: 'proj-lumina',
    title: 'Lumina Brand Redesign',
    description: 'Establish a new identity for Lumina Wellness. Needs to balance premium luxury with high engagement for a youthful demographic.',
    clientId: 'user-client',
    freelancerId: 'user-freelancer',
    status: 'in-progress',
    dueDate: '2026-07-20',
    createdAt: '2026-06-10T12:00:00Z',
  }
];

const mockChats: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'user-client',
    receiverId: 'user-freelancer',
    projectId: 'proj-lumina',
    message: 'Hey Alex, really excited to start. I want my logo to feel luxurious and youthful. Can we do something like that?',
    type: 'text',
    timestamp: '2026-06-11T14:30:00Z'
  },
  {
    id: 'msg-2',
    senderId: 'user-freelancer',
    receiverId: 'user-client',
    projectId: 'proj-lumina',
    message: "Hi Sarah! Excited to work together. I've received your brief. Let's explore some clean fonts and rich colors. I'll translate this into our formal style parameters.",
    type: 'text',
    timestamp: '2026-06-11T14:45:00Z'
  },
  {
    id: 'msg-3',
    senderId: 'user-client',
    receiverId: 'user-freelancer',
    projectId: 'proj-lumina',
    message: 'Make it pop and feel very premium, but not boring or old school.',
    type: 'text',
    timestamp: '2026-06-12T09:15:00Z',
    isEnhanced: false
  }
];

const mockTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-lumina',
    title: 'Brand Brief Translation & Alignment',
    description: 'Translate client requests into technical parameters and get visual preview approval.',
    status: 'completed',
    deadline: '2026-06-15',
    assigneeId: 'user-freelancer',
    comments: [
      {
        id: 'c-1',
        userName: 'Alex Rivera',
        userRole: 'freelancer',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        text: 'The translation looks solid. Sarah approved the color direction.',
        timestamp: '2026-06-14T10:00:00Z'
      }
    ]
  },
  {
    id: 'task-2',
    projectId: 'proj-lumina',
    title: 'Logo Concept Exploration',
    description: 'Sketch 3 initial directions combining minimalist geometries with serif/sans-serif hybrids.',
    status: 'inprogress',
    deadline: '2026-06-25',
    assigneeId: 'user-freelancer',
    comments: []
  },
  {
    id: 'task-3',
    projectId: 'proj-lumina',
    title: 'Color System Development',
    description: 'Develop full HSL palette containing dark Slate, Gold accents, and clean White workspace backing.',
    status: 'todo',
    deadline: '2026-06-30',
    assigneeId: 'user-freelancer',
    comments: []
  },
  {
    id: 'task-4',
    projectId: 'proj-lumina',
    title: 'Final Assets & Styleguide Handoff',
    description: 'Package logos (SVG, PNG), font licenses, and guidelines PDF.',
    status: 'todo',
    deadline: '2026-07-15',
    assigneeId: 'user-freelancer',
    comments: []
  }
];

const mockFiles: ProjectFile[] = [
  {
    id: 'file-1',
    projectId: 'proj-lumina',
    uploadedBy: 'user-freelancer',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    name: 'Lumina_Project_Timeline.pdf',
    type: 'application/pdf',
    size: '142 KB',
    timestamp: '2026-06-11T12:00:00Z'
  }
];

const mockBriefs: TranslatedBrief[] = [
  {
    id: 'brief-1',
    projectId: 'proj-lumina',
    originalPrompt: 'I want my logo to feel luxurious and youthful.',
    objective: 'Create a modern wellness brand logo targeting design-conscious younger audiences.',
    styleKeywords: ['Minimalist', 'Premium', 'Contemporary', 'Vibrant'],
    colors: ['#090d16', '#d97706', '#f8fafc', '#8b5cf6'],
    typography: 'Outfit & Inter (Geometric Sans-Serif)',
    targetAudience: 'Ages 18–35, wellness-oriented, active on social channels.',
    timestamp: '2026-06-12T10:00:00Z'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    projectId: 'proj-lumina',
    title: 'Milestone 1: Alignment & Brand Coordinates Approved',
    amount: 750,
    status: 'paid',
    dueDate: '2026-06-15',
    createdAt: '2026-06-12T11:00:00Z'
  },
  {
    id: 'inv-2',
    projectId: 'proj-lumina',
    title: 'Milestone 2: Brand Concepts & Final Package Handoff',
    amount: 1500,
    status: 'pending',
    dueDate: '2026-07-15',
    createdAt: '2026-06-16T09:00:00Z'
  }
];

// --- Context Definition ---

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(isSupabaseConfigured() ? [] : mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(isSupabaseConfigured() ? [] : mockProjects);
  const [chats, setChats] = useState<ChatMessage[]>(isSupabaseConfigured() ? [] : mockChats);
  const [tasks, setTasks] = useState<Task[]>(isSupabaseConfigured() ? [] : mockTasks);
  const [files, setFiles] = useState<ProjectFile[]>(isSupabaseConfigured() ? [] : mockFiles);
  const [briefs, setBriefs] = useState<TranslatedBrief[]>(isSupabaseConfigured() ? [] : mockBriefs);
  const [invoices, setInvoices] = useState<Invoice[]>(isSupabaseConfigured() ? [] : mockInvoices);
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [freelancersCatalog] = useState<FreelancerProfile[]>(mockFreelancersCatalog);

  const saveGeminiApiKey = (key: string | null) => {
    setGeminiApiKey(key);
    if (key) {
      localStorage.setItem('chatable_gemini_key', key);
    } else {
      localStorage.removeItem('chatable_gemini_key');
    }
  };

  const callGemini = async (prompt: string): Promise<string> => {
    if (!geminiApiKey) throw new Error("Gemini API key is not configured.");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Gemini API call failed");
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini API");
    return text;
  };

  // v3.0 Auth States
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const activeProject = projects[0] || (isSupabaseConfigured() ? null : mockProjects[0]);

  // 1. Initial State Loading Engine (Supabase or LocalStorage)
  useEffect(() => {
    // Load Gemini API Key
    const savedKey = localStorage.getItem('chatable_gemini_key');
    if (savedKey) setGeminiApiKey(savedKey);

    let activeChannel: any = null;
    let lastUserId: string | null = null;

    if (isSupabaseConfigured()) {
      console.log("Chatable V3: Connecting to live Supabase backend...");

      // Listen to auth changes (replaces getSession + onAuthStateChange to prevent duplicate setup)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log("Supabase Auth Event:", event, newSession?.user?.id);
        setSession(newSession);
        
        if (newSession) {
          const currentUserId = newSession.user.id;
          fetchSupabaseState(currentUserId);
          
          if (activeChannel && lastUserId !== currentUserId) {
            // User changed, clean up previous channel
            try {
              supabase.removeChannel(activeChannel);
            } catch (e) {
              console.error("Error removing old channel:", e);
            }
            activeChannel = null;
          }

          if (!activeChannel) {
            lastUserId = currentUserId;
            activeChannel = subscribeSupabaseRealtime(currentUserId);
          }
        } else {
          // Reset states on logout
          setUsers(isSupabaseConfigured() ? [] : mockUsers);
          setCurrentUser(null);
          setProjects(isSupabaseConfigured() ? [] : mockProjects);
          setChats(isSupabaseConfigured() ? [] : mockChats);
          setTasks(isSupabaseConfigured() ? [] : mockTasks);
          setFiles(isSupabaseConfigured() ? [] : mockFiles);
          setBriefs(isSupabaseConfigured() ? [] : mockBriefs);
          setInvoices(isSupabaseConfigured() ? [] : mockInvoices);
          
          if (activeChannel) {
            try {
              supabase.removeChannel(activeChannel);
            } catch (e) {
              console.error("Error removing channel on logout:", e);
            }
            activeChannel = null;
            lastUserId = null;
          }
        }
        setAuthLoading(false);
      });

      return () => {
        subscription.unsubscribe();
        if (activeChannel) {
          try {
            supabase.removeChannel(activeChannel);
          } catch (e) {
            console.error("Error removing channel on cleanup:", e);
          }
        }
      };
    } else {
      console.log("Chatable V3: Supabase not configured. Running offline simulation.");
      loadOfflineState();
      setAuthLoading(false);
    }
  }, []);

  // Sync state to local storage when in offline mode only
  const syncOfflineStorage = () => {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('chatable_users_v2', JSON.stringify(users));
      localStorage.setItem('chatable_projects_v2', JSON.stringify(projects));
      localStorage.setItem('chatable_chats_v2', JSON.stringify(chats));
      localStorage.setItem('chatable_tasks_v2', JSON.stringify(tasks));
      localStorage.setItem('chatable_files_v2', JSON.stringify(files));
      localStorage.setItem('chatable_briefs_v2', JSON.stringify(briefs));
      localStorage.setItem('chatable_invoices_v2', JSON.stringify(invoices));
    }
  };

  useEffect(() => {
    syncOfflineStorage();
  }, [users, projects, chats, tasks, files, briefs, invoices]);

  const loadOfflineState = () => {
    const offlineUsers = localStorage.getItem('chatable_users_v2');
    const offlineProjects = localStorage.getItem('chatable_projects_v2');
    const offlineChats = localStorage.getItem('chatable_chats_v2');
    const offlineTasks = localStorage.getItem('chatable_tasks_v2');
    const offlineFiles = localStorage.getItem('chatable_files_v2');
    const offlineBriefs = localStorage.getItem('chatable_briefs_v2');
    const offlineInvoices = localStorage.getItem('chatable_invoices_v2');
    const offlineSession = localStorage.getItem('chatable_mock_session');

    if (offlineUsers) setUsers(JSON.parse(offlineUsers));
    if (offlineProjects) setProjects(JSON.parse(offlineProjects));
    if (offlineChats) setChats(JSON.parse(offlineChats));
    if (offlineTasks) setTasks(JSON.parse(offlineTasks));
    if (offlineFiles) setFiles(JSON.parse(offlineFiles));
    if (offlineBriefs) setBriefs(JSON.parse(offlineBriefs));
    if (offlineInvoices) setInvoices(JSON.parse(offlineInvoices));

    if (offlineSession) {
      const sess = JSON.parse(offlineSession);
      setSession(sess);
      
      const uList = offlineUsers ? JSON.parse(offlineUsers) : mockUsers;
      const found = uList.find((u: User) => u.id === sess.user.id);
      if (found) setCurrentUser(found);
    }
  };

  // 2. Supabase Integration
  const fetchSupabaseState = async (userId: string) => {
    try {
      // Profiles (Users)
      const { data: dbProfiles } = await supabase.from('profiles').select('*');
      if (dbProfiles && dbProfiles.length > 0) {
        const mappedUsers: User[] = dbProfiles.map(p => ({
          id: p.id,
          fullName: p.full_name,
          email: p.email,
          role: p.role,
          profileImage: p.profile_image,
          bio: p.bio,
          isSuspended: p.is_suspended,
          reputationScore: p.reputation_score,
          metrics: p.metrics || {},
          createdAt: p.created_at
        }));
        setUsers(mappedUsers);
        
        const matchingUser = mappedUsers.find(u => u.id === userId);
        if (matchingUser) {
          setCurrentUser(matchingUser);
        }
      }

      // Projects
      const { data: dbProjects } = await supabase.from('projects').select('*');
      if (dbProjects && dbProjects.length > 0) {
        setProjects(dbProjects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          clientId: p.client_id,
          freelancerId: p.freelancer_id,
          status: p.status,
          dueDate: p.due_date,
          createdAt: p.created_at
        })));
      } else {
        setProjects([]);
      }

      // Load related data from Supabase only if we are using a real database project
      const hasRealProjects = dbProjects && dbProjects.length > 0;
      if (hasRealProjects) {
        // Chats
        const { data: dbChats } = await supabase.from('chats').select('*').order('created_at', { ascending: true });
        if (dbChats) {
          setChats(dbChats.map(c => ({
            id: c.id,
            senderId: c.sender_id,
            receiverId: c.receiver_id,
            projectId: c.project_id,
            message: c.message,
            type: c.type,
            timestamp: c.created_at,
            fileUrl: c.file_url,
            fileName: c.file_name,
            fileSize: c.file_size,
            isEnhanced: c.is_enhanced,
            originalMessage: c.original_message,
            isFlagged: c.is_flagged
          })));
        }

        // Tasks
        const { data: dbTasks } = await supabase.from('tasks').select('*');
        if (dbTasks) {
          setTasks(dbTasks.map(t => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            description: t.description,
            status: t.status,
            deadline: t.deadline,
            assigneeId: t.assignee_id,
            comments: t.comments || []
          })));
        }

        // Invoices
        const { data: dbInvoices } = await supabase.from('invoices').select('*');
        if (dbInvoices) {
          setInvoices(dbInvoices.map(i => ({
            id: i.id,
            projectId: i.project_id,
            title: i.title,
            amount: parseFloat(i.amount),
            status: i.status,
            dueDate: i.due_date,
            createdAt: i.created_at
          })));
        }

        // Files
        const { data: dbFiles } = await supabase.from('files').select('*');
        if (dbFiles) {
          setFiles(dbFiles.map(f => ({
            id: f.id,
            projectId: f.project_id,
            uploadedBy: f.uploaded_by,
            url: f.url,
            name: f.name,
            type: f.type,
            size: f.size,
            timestamp: f.created_at
          })));
        }

        // Briefs
        const { data: dbBriefs } = await supabase.from('briefs').select('*');
        if (dbBriefs) {
          setBriefs(dbBriefs.map(b => ({
            id: b.id,
            projectId: b.project_id,
            originalPrompt: b.original_prompt,
            objective: b.objective,
            styleKeywords: b.style_keywords || [],
            colors: b.colors || [],
            typography: b.typography,
            targetAudience: b.target_audience,
            timestamp: b.created_at
          })));
        }
      }
    } catch (err) {
      console.error("Supabase Database Sync Error:", err);
    }
  };

  const subscribeSupabaseRealtime = (userId: string) => {
    return supabase
      .channel(`chatable_realtime_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchSupabaseState(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchSupabaseState(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        fetchSupabaseState(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => {
        fetchSupabaseState(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchSupabaseState(userId);
      })
      .subscribe();
  };

  // 3. Authentications Action triggers (V3.0 addition)
  const signUpUser = async (
    email: string,
    password: string,
    fullName: string,
    role: 'client' | 'freelancer',
    bio: string
  ): Promise<{ error: any }> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            bio,
            profile_image: `https://images.unsplash.com/photo-${role === 'client' ? '1494790108377-be9c29b29330' : '1507003211169-0a1dd7228f2d'}?w=150`
          }
        }
      });
      return { error };
    } else {
      // Mock signup persistence
      const mockId = `mock-user-${Date.now()}`;
      const newUser: User = {
        id: mockId,
        fullName,
        email,
        role,
        profileImage: `https://images.unsplash.com/photo-${role === 'client' ? '1494790108377-be9c29b29330' : '1507003211169-0a1dd7228f2d'}?w=150`,
        bio,
        isSuspended: false,
        reputationScore: 95,
        metrics: role === 'client' 
          ? { paymentSpeed: 'Instant (Avg 1hr)', scopeCreep: 'Minimal (0%)', revisionRate: 'Low' }
          : { deliverySpeed: '100% On-Time', completionRate: '100%', revisionRate: '1.0' },
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      
      const mockSess = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user: {
          id: mockId,
          email,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {}
        }
      } as unknown as Session;

      localStorage.setItem('chatable_mock_session', JSON.stringify(mockSess));
      setSession(mockSess);
      setCurrentUser(newUser);
      
      return { error: null };
    }
  };

  const signInUser = async (email: string, password: string): Promise<{ error: any }> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } else {
      const found = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      if (found) {
        // Mock session
        const mockSess = {
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh',
          user: {
            id: found.id,
            email: found.email,
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {}
          }
        } as unknown as Session;

        localStorage.setItem('chatable_mock_session', JSON.stringify(mockSess));
        setSession(mockSess);
        setCurrentUser(found);
        return { error: null };
      } else {
        return { error: { message: "Invalid credentials. Email not found in registry." } };
      }
    }
  };

  const signOutUser = async (): Promise<void> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('chatable_mock_session');
      setSession(null);
      setCurrentUser(null);
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'apple'): Promise<{ error: any }> => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      return { error };
    } else {
      const mockId = `mock-oauth-${provider}-${Date.now()}`;
      const newUser: User = {
        id: mockId,
        fullName: `${provider === 'google' ? 'Google' : 'Apple'} Sandbox User`,
        email: `oauth.${provider}.${Date.now()}@chatable.app`,
        role: 'client',
        profileImage: provider === 'google' 
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' 
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: 'Simulated OAuth registry user profile.',
        isSuspended: false,
        reputationScore: 97,
        metrics: { paymentSpeed: 'Instant', scopeCreep: 'None', revisionRate: '1.0' },
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);

      const mockSess = {
        access_token: 'mock-oauth-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-oauth-refresh',
        user: {
          id: mockId,
          email: newUser.email,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {}
        }
      } as unknown as Session;

      localStorage.setItem('chatable_mock_session', JSON.stringify(mockSess));
      setSession(mockSess);
      setCurrentUser(newUser);

      return { error: null };
    }
  };

  // Switch role inside sandbox (used for testing/debugging)
  const switchRole = (role: 'client' | 'freelancer' | 'admin') => {
    localStorage.setItem('chatable_active_role_v2', role);
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      
      // Update session user mock to match ID
      const mockSess = {
        access_token: 'mock-token',
        user: { id: found.id, email: found.email }
      } as unknown as Session;
      setSession(mockSess);
    }
  };

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    if (isSupabaseConfigured() && projectId !== 'proj-lumina') {
      await supabase.from('projects').update({ status }).eq('id', projectId);
    } else {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
    }
  };

  const triggerAutoReply = async (userMsg: string, senderId: string, receiverId: string) => {
    const receiver = users.find(u => u.id === receiverId);
    const sender = users.find(u => u.id === senderId);
    if (!receiver || !sender || !activeProject) return;

    setTimeout(async () => {
      let replyText = "";
      
      if (geminiApiKey) {
        try {
          const systemContext = `You are ${receiver.fullName}, a ${receiver.role} collaborating on the project "${activeProject.title}".
Underlying Project Scope: ${activeProject.description}.
Your persona/profile bio: ${receiver.bio}.
You are conversing with the ${sender.role} ${sender.fullName}.
Write a natural, helpful, direct chat message response (1-2 sentences) reacting to their message: "${userMsg}".
Do not include any greeting prefix or tag. Reply directly as the person.`;
          
          replyText = await callGemini(systemContext);
        } catch (err) {
          console.error("Auto-responder Gemini Error:", err);
          replyText = `Thanks for the details! Let me check this right away.`;
        }
      } else {
        const msg = userMsg.toLowerCase();
        if (msg.includes('invoice') || msg.includes('payment') || msg.includes('pay') || msg.includes('escrow')) {
          replyText = receiver.role === 'client' 
            ? "I've reviewed the deliverables and released the milestone payment for you! Let me know if the funds are visible."
            : "I've created the milestone invoice for this stage. Please let me know once the escrow is funded so I can proceed.";
        } else if (msg.includes('brief') || msg.includes('translate') || msg.includes('requirement')) {
          replyText = receiver.role === 'client'
            ? "The translated brief looks very precise. Let's base our task list and milestones on these guidelines."
            : "I've analyzed the translated guidelines. I'll break this down into actionable subtasks on our Kanban board now.";
        } else if (msg.includes('task') || msg.includes('todo') || msg.includes('kanban') || msg.includes('progress')) {
          replyText = "Great. I've updated the task cards on the Kanban board to reflect the current status.";
        } else {
          replyText = receiver.role === 'client'
            ? `Sounds good! Let's align on these deliverables. Let me know if you need any resources from my end.`
            : `Got it! I will start working on this immediately and post my progress here.`;
        }
      }

      if (isSupabaseConfigured() && activeProject.id !== 'proj-lumina') {
        await supabase.from('chats').insert({
          sender_id: receiver.id,
          receiver_id: sender.id,
          project_id: activeProject.id,
          message: replyText,
          type: 'text'
        });
      } else {
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: receiver.id,
          receiverId: sender.id,
          projectId: activeProject.id,
          message: replyText,
          type: 'text',
          timestamp: new Date().toISOString()
        };
        setChats(prev => [...prev, replyMsg]);
      }
    }, 2000);
  };

  const sendChatMessage = async (
    message: string,
    type: 'text' | 'file' | 'audio' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: string
  ) => {
    if (!activeProject || !currentUser) return;
    
    // Determine the receiver ID
    let receiverId = currentUser.role === 'client' ? 'user-freelancer' : 'user-client';
    if (activeProject && activeProject.id !== 'proj-lumina') {
      receiverId = currentUser.id === activeProject.clientId 
        ? activeProject.freelancerId 
        : activeProject.clientId;
    }

    if (isSupabaseConfigured() && activeProject.id !== 'proj-lumina') {
      await supabase.from('chats').insert({
        sender_id: currentUser.id,
        receiver_id: receiverId,
        project_id: activeProject.id,
        message,
        type,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize
      });
    } else {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        receiverId,
        projectId: activeProject.id,
        message,
        type,
        timestamp: new Date().toISOString(),
        fileUrl,
        fileName,
        fileSize
      };
      setChats(prev => [...prev, newMessage]);
    }

    // Trigger AI collaborator reply simulation if talking to sandbox/mock counterparts
    const isMockCounterpart = receiverId === 'user-freelancer' || 
                              receiverId === 'user-client' || 
                              receiverId.startsWith('mock-') ||
                              receiverId.startsWith('f-');
    if (isMockCounterpart) {
      triggerAutoReply(message, currentUser.id, receiverId);
    }
  };

  // Live Gemini API Helper
  const enhanceMessage = async (messageId: string) => {
    const msg = chats.find(c => c.id === messageId);
    if (!msg) return;

    if (!geminiApiKey) {
      setChats(prev =>
        prev.map(c => {
          if (c.id === messageId) {
            let enhancedText = c.message;
            if (c.message.toLowerCase().includes('pop')) {
              enhancedText = 'Increase visual contrast across core landing page layouts, establishing clear typographic weight hierarchy and accentuating call-to-action triggers.';
            } else if (c.message.toLowerCase().includes('apple')) {
              enhancedText = 'Design a clean, minimal interface utilizing extensive negative space, clean typography (sans-serif), high-contrast styling, and premium product-centric imagery.';
            } else if (c.message.toLowerCase().includes('richer')) {
              enhancedText = 'Refine color values to include deeper slate textures and metallic amber/gold accents, paired with subtle drop shadows and glassmorphic blur layers to convey a high-end feel.';
            } else if (c.message.toLowerCase().includes('gen z')) {
              enhancedText = 'Implement a highly dynamic aesthetic using bold gradients, interactive hovering effects, micro-animations, rounded components, and layout blocks geared towards mobile-first interaction.';
            } else {
              enhancedText = `Optimize functional clarity: ${c.message}. Build consistent components focusing on refined padding, soft borders, and an elegant dark theme.`;
            }

            return {
              ...c,
              originalMessage: c.message,
              message: enhancedText,
              isEnhanced: true
            };
          }
          return c;
        })
      );
      return;
    }

    setChats(prev =>
      prev.map(c => (c.id === messageId ? { ...c, message: 'AI is translating feedback...', isEnhanced: true, originalMessage: c.message } : c))
    );

    try {
      const prompt = `You are a creative interpreter. A client sent this feedback: "${msg.message}". Rewrite this feedback into a professional, precise, technical design specification for designers and developers. Focus on layout structures, color spaces, typography adjustments, and clear visual goals. Keep it to 1-3 professional sentences. Output ONLY the rewritten specification, no headers or quotes.`;
      const resultText = await callGemini(prompt);
      
      if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
        await supabase.from('chats').update({
          message: resultText.trim(),
          is_enhanced: true,
          original_message: msg.message
        }).eq('id', messageId);
      } else {
        setChats(prev =>
          prev.map(c => (c.id === messageId ? { ...c, message: resultText.trim() } : c))
        );
      }
    } catch (err) {
      console.error(err);
      setChats(prev =>
        prev.map(c => (c.id === messageId ? { ...c, message: `Could not reach Gemini. Original: ${msg.message}` } : c))
      );
    }
  };

  const translateClientBrief = async (prompt: string): Promise<TranslatedBrief> => {
    if (!geminiApiKey) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let objective = 'Formulate a professional brand identity solution based on core customer inputs.';
          let styleKeywords = ['Minimalist', 'Premium', 'Modern'];
          let colors = ['#090d16', '#8b5cf6', '#06b6d4', '#f1f5f9'];
          let typography = 'Inter (Clean Sans-Serif)';
          let targetAudience = 'Broad target audience.';

          const lowerPrompt = prompt.toLowerCase();
          if (lowerPrompt.includes('luxurious') || lowerPrompt.includes('luxury')) {
            objective = 'Establish a highly premium brand identity tailored for upscale products.';
            styleKeywords = ['Elegant', 'Luxurious', 'High-End', 'Sophisticated'];
            colors = ['#090d16', '#d97706', '#f8fafc', '#263147'];
            typography = 'Playfair Display & Outfit (Serif & Sans hybrid)';
            targetAudience = 'Ages 25–45, luxury consumers seeking prestige quality.';
          } else if (lowerPrompt.includes('youthful') || lowerPrompt.includes('young')) {
            objective = 'Design a high-energy brand appearance targeted at digital-native consumers.';
            styleKeywords = ['Vibrant', 'Youthful', 'Dynamic', 'Bold'];
            colors = ['#090d16', '#8b5cf6', '#06b6d4', '#ec4899'];
            typography = 'Plus Jakarta Sans & Outfit (Bold Geometrics)';
            targetAudience = 'Gen Z & Millennial consumers, mobile-first users.';
          } else if (lowerPrompt.includes('tech') || lowerPrompt.includes('minimal')) {
            objective = 'Create a streamlined, future-proof identity for technical products.';
            styleKeywords = ['Minimalist', 'Tech-focused', 'Futuristic', 'Clean'];
            colors = ['#0b0f19', '#06b6d4', '#10b981', '#1e293b'];
            typography = 'Fira Code & Inter (Technical Mono-spaced accents)';
            targetAudience = 'Developers, tech enthusiasts, and efficiency-driven professionals.';
          }

          const newBrief: TranslatedBrief = {
            id: `brief-${Date.now()}`,
            projectId: activeProject?.id || 'proj-lumina',
            originalPrompt: prompt,
            objective,
            styleKeywords,
            colors,
            typography,
            targetAudience,
            timestamp: new Date().toISOString()
          };

          setBriefs(prev => [newBrief, ...prev]);
          resolve(newBrief);
        }, 1800);
      });
    }

    try {
      const instructions = `You are a design brief translation engine. The client wants to build a product and says: "${prompt}". 
Translate this request into an industry-grade design brief. You MUST output ONLY a valid JSON object matching the following structure:
{
  "objective": "Detailed objective of the design campaign",
  "styleKeywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4"],
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "typography": "Selected Heading & Body font pair",
  "targetAudience": "Target demographics"
}
Rules:
1. Return strictly JSON. No markdown ticks, no "json" headers, no extra text.
2. The color palette must contain 4 colors: background (dark, like #0a0e1a), primary accent, secondary accent, and light body contrast color.
3. Keep objective under 25 words.`;

      const result = await callGemini(instructions);
      const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const briefId = `brief-${Date.now()}`;
      const briefData = {
        project_id: activeProject?.id || 'proj-lumina',
        user_id: currentUser ? currentUser.id : 'user-client',
        original_prompt: prompt,
        objective: parsed.objective || 'Design project branding',
        style_keywords: parsed.styleKeywords || ['Modern', 'Premium'],
        colors: parsed.colors || ['#090d16', '#8b5cf6', '#06b6d4', '#f1f5f9'],
        typography: parsed.typography || 'Inter & Outfit',
        target_audience: parsed.targetAudience || 'General audience'
      };

      if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
        await supabase.from('briefs').insert(briefData);
      }

      const newBrief: TranslatedBrief = {
        id: briefId,
        projectId: briefData.project_id,
        originalPrompt: prompt,
        objective: briefData.objective,
        styleKeywords: briefData.style_keywords,
        colors: briefData.colors,
        typography: briefData.typography,
        targetAudience: briefData.target_audience,
        timestamp: new Date().toISOString()
      };

      if (!isSupabaseConfigured() || (activeProject && activeProject.id === 'proj-lumina')) {
        setBriefs(prev => [newBrief, ...prev]);
      }
      return newBrief;
    } catch (err) {
      console.error("Gemini Brief Error:", err);
      throw new Error(`Failed to parse Gemini translation: ${err}`);
    }
  };

  const createInvoice = async (title: string, amount: number, dueDate: string) => {
    if (!activeProject) return;

    if (isSupabaseConfigured() && activeProject.id !== 'proj-lumina') {
      await supabase.from('invoices').insert({
        project_id: activeProject.id,
        title,
        amount,
        status: 'pending',
        due_date: dueDate
      });
    } else {
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        projectId: activeProject.id,
        title,
        amount,
        status: 'pending',
        dueDate,
        createdAt: new Date().toISOString()
      };
      setInvoices(prev => [...prev, newInvoice]);
    }

    sendChatMessage(`Submitted Milestone Invoice: "${title}" for $${amount}.`, 'text');
  };

  const payInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);

    if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
      await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoiceId);
    } else {
      setInvoices(prev =>
        prev.map(inv => (inv.id === invoiceId ? { ...inv, status: 'paid' } : inv))
      );
    }

    if (invoice) {
      sendChatMessage(`Released Escrow Funds: paid invoice of $${invoice.amount} for "${invoice.title}".`, 'text');
    }
  };

  const addTask = async (title: string, description: string, deadline: string, assigneeId?: string) => {
    if (!activeProject) return;

    if (isSupabaseConfigured() && activeProject.id !== 'proj-lumina') {
      await supabase.from('tasks').insert({
        project_id: activeProject.id,
        title,
        description,
        status: 'todo',
        deadline,
        assignee_id: assigneeId || 'user-freelancer',
        comments: []
      });
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        projectId: activeProject.id,
        title,
        description,
        status: 'todo',
        deadline,
        assigneeId: assigneeId || 'user-freelancer',
        comments: []
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
      await supabase.from('tasks').update({ status }).eq('id', taskId);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    }
  };

  const updateTaskDetails = async (taskId: string, updates: Partial<Task>) => {
    if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.deadline) dbUpdates.deadline = updates.deadline;
      if (updates.assigneeId) dbUpdates.assignee_id = updates.assigneeId;
      if (updates.comments) dbUpdates.comments = updates.comments;

      await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    }
  };

  const addTaskComment = async (taskId: string, text: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      userName: currentUser ? currentUser.fullName : 'Anonymous',
      userRole: currentUser ? currentUser.role : 'client',
      profileImage: currentUser ? currentUser.profileImage : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      text,
      timestamp: new Date().toISOString()
    };

    const updatedComments = [...(task.comments || []), newComment];

    if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
      await supabase.from('tasks').update({ comments: updatedComments }).eq('id', taskId);
    } else {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, comments: updatedComments } : t))
      );
    }
  };

  const uploadProjectFile = async (name: string, type: string, size: string, url: string) => {
    if (!activeProject || !currentUser) return;

    if (isSupabaseConfigured() && activeProject.id !== 'proj-lumina') {
      try {
        await supabase.from('files').insert({
          project_id: activeProject.id,
          uploaded_by: currentUser.id,
          url,
          name,
          type,
          size
        });
      } catch (err) {
        console.error("Supabase File Insert Error:", err);
      }
    } else {
      const newFile: ProjectFile = {
        id: `file-${Date.now()}`,
        projectId: activeProject.id,
        uploadedBy: currentUser.id,
        url,
        name,
        type,
        size,
        timestamp: new Date().toISOString()
      };
      setFiles(prev => [newFile, ...prev]);
    }

    sendChatMessage(`Uploaded a file: ${name}`, 'file', url, name, size);
  };

  const toggleUserSuspension = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (isSupabaseConfigured()) {
      await supabase.from('profiles').update({ is_suspended: !user.isSuspended }).eq('id', userId);
    } else {
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
      );
    }
  };

  const flagMessage = async (messageId: string) => {
    if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
      await supabase.from('chats').update({ is_flagged: true }).eq('id', messageId);
    } else {
      setChats(prev => prev.map(c => c.id === messageId ? { ...c, isFlagged: true } : c));
    }
  };

  const dismissMessageFlag = async (messageId: string) => {
    if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
      await supabase.from('chats').update({ is_flagged: false }).eq('id', messageId);
    } else {
      setChats(prev => prev.map(c => c.id === messageId ? { ...c, isFlagged: false } : c));
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (isSupabaseConfigured() && activeProject && activeProject.id !== 'proj-lumina') {
      await supabase.from('chats').delete().eq('id', messageId);
    } else {
      setChats(prev => prev.filter(c => c.id !== messageId));
    }
  };

  const createProject = async (title: string, description: string, freelancerId: string, dueDate: string): Promise<{ error: any }> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('projects').insert({
          title,
          description,
          client_id: currentUser?.id,
          freelancer_id: freelancerId,
          status: 'in-progress',
          due_date: dueDate
        }).select();

        if (error) throw error;
        if (data && data.length > 0) {
          const p = data[0];
          const newProj: Project = {
            id: p.id,
            title: p.title,
            description: p.description,
            clientId: p.client_id,
            freelancerId: p.freelancer_id,
            status: p.status,
            dueDate: p.due_date,
            createdAt: p.created_at
          };
          setProjects(prev => [newProj, ...prev]);
        }
        return { error: null };
      } catch (err: any) {
        console.error("Failed to create project in Supabase:", err);
        return { error: err };
      }
    } else {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        title,
        description,
        clientId: currentUser?.id || 'user-client',
        freelancerId,
        status: 'in-progress',
        dueDate,
        createdAt: new Date().toISOString()
      };
      setProjects(prev => [newProj, ...prev]);
      return { error: null };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        chats,
        tasks,
        files,
        briefs,
        activeProject,
        
        // v2.0 parameters
        geminiApiKey,
        invoices,
        freelancersCatalog,
        saveGeminiApiKey,
        createInvoice,
        payInvoice,

        // v3.0 Auth parameters
        session,
        authLoading,
        signUpUser,
        signInUser,
        signOutUser,
        signInWithOAuth,

        switchRole,
        updateProjectStatus,
        createProject,
        sendChatMessage,
        enhanceMessage,
        translateClientBrief,
        addTask,
        updateTaskStatus,
        updateTaskDetails,
        addTaskComment,
        uploadProjectFile,
        toggleUserSuspension,
        flagMessage,
        dismissMessageFlag,
        deleteMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
