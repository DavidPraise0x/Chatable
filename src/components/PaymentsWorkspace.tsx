import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Invoice } from '../context/AppContext';
import { DollarSign, ShieldAlert, Calendar, Plus, X, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PaymentsWorkspace: React.FC = () => {
  const { currentUser, invoices, createInvoice, payInvoice } = useApp();

  // Modals state
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // New Invoice Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Checkout Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Calculations
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    createInvoice(
      newTitle,
      parseFloat(newAmount),
      newDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    // Reset Form
    setNewTitle('');
    setNewAmount('');
    setNewDueDate('');
    setIsNewInvoiceOpen(false);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutInvoice) return;

    setIsProcessingPayment(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      payInvoice(checkoutInvoice.id);
      setIsProcessingPayment(false);
      setIsPaymentSuccess(true);
      
      // Auto-close success modal after 2 seconds
      setTimeout(() => {
        setIsPaymentSuccess(false);
        setCheckoutInvoice(null);
        // Reset card details
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardName('');
      }, 2000);
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Escrow Status Header Summary */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-brand-cyan/20 text-brand-cyan rounded-xl">
            <DollarSign size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Contract value</span>
            <span className="text-xl font-bold text-white mt-0.5">${totalPaid + totalPending}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-green-500/20 text-green-450 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Released to Freelancer</span>
            <span className="text-xl font-bold text-white mt-0.5">${totalPaid}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-brand-amber/20 text-brand-amber rounded-xl">
            <ShieldAlert size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Locked in Safe Escrow</span>
            <span className="text-xl font-bold text-white mt-0.5">${totalPending}</span>
          </div>
        </div>
      </div>

      {/* Invoices List Grid */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-brand-purple" />
              <h2 className="text-base font-bold text-white">Milestone Invoices</h2>
            </div>
            
            {currentUser?.role === 'freelancer' && (
              <button
                onClick={() => setIsNewInvoiceOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-brand-purple/15"
              >
                <Plus size={14} />
                <span>Bill Milestone</span>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Escrow deposits are securely processed through Chatable. Clients release locked milestone funds upon reviewing tasks.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-surface-dark/45 border border-border-dark/65 p-4 rounded-xl flex items-center justify-between hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col gap-1.5 max-w-[65%]">
                  <h4 className="text-xs font-bold text-white leading-relaxed">{inv.title}</h4>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={11} /> Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-brand-cyan uppercase">Project Escrow</span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-black font-mono text-white">${inv.amount}</span>
                    <span
                      className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        inv.status === 'paid'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-brand-amber/10 text-brand-amber'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {inv.status === 'pending' && currentUser?.role === 'client' && (
                    <button
                      onClick={() => setCheckoutInvoice(inv)}
                      className="px-3.5 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-brand-cyan/20"
                    >
                      Release Escrow
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escrow Guidelines Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-405" />
            <h3 className="text-base font-bold text-white">Escrow Protection</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Chatable utilizes an automated escrow contract system. When a project is initiated, client deposits the budget into escrow.
          </p>
          <div className="bg-surface-dark/40 border border-border-dark p-3.5 rounded-xl text-xs flex flex-col gap-2">
            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">How to test payments:</span>
            <ul className="list-disc pl-4 flex flex-col gap-1.5 text-gray-400">
              <li>Switch to **Freelancer** to submit a new invoice request.</li>
              <li>Switch to **Client** to pay and release the escrow cash.</li>
              <li>A checkout screen will popup asking for mock payment details.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL: Submit Invoice */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-dark bg-surface-dark/40">
              <h3 className="text-base font-bold text-white">Bill Milestone</h3>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Milestone 3: Interface Prototyping Complete"
                  className="glass-input rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="500"
                    className="glass-input rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="glass-input rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-purple/20"
              >
                Submit Milestone Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Credit Card Checkout */}
      {checkoutInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
            
            {/* Success State Overlay */}
            {isPaymentSuccess && (
              <div className="absolute inset-0 bg-surface-dark z-55 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="p-4 bg-green-500/20 text-green-400 rounded-full mb-4 animate-scale-up">
                  <CheckCircle2 size={44} className="animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Escrow Released</h3>
                <p className="text-xs text-gray-450 mt-1 max-w-[200px]">
                  Payment of ${checkoutInvoice.amount} has been successfully sent to the designer.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-5 border-b border-border-dark bg-surface-dark/40">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-wider">Chatable Escrow Payments</span>
                <h3 className="text-xs font-black text-white">Payment Checkout</h3>
              </div>
              <button
                onClick={() => setCheckoutInvoice(null)}
                disabled={isProcessingPayment}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col items-center bg-surface-dark/30 border border-border-dark p-3.5 rounded-xl gap-0.5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Escrow Value</span>
                <span className="text-lg font-mono font-black text-brand-cyan">${checkoutInvoice.amount}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Sarah Chen"
                  className="glass-input rounded-xl px-4 py-2.5 text-xs text-white uppercase"
                  disabled={isProcessingPayment}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                  placeholder="4000 1234 5678 9010"
                  className="glass-input rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  disabled={isProcessingPayment}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                    placeholder="MM/YY"
                    className="glass-input rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                    disabled={isProcessingPayment}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">CVV Code</label>
                  <input
                    type="password"
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    placeholder="123"
                    className="glass-input rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                    disabled={isProcessingPayment}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full mt-2 py-3 bg-brand-cyan hover:bg-brand-cyan/95 disabled:bg-brand-cyan/35 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-cyan/20 flex justify-center items-center gap-1.5"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Release Milestone Funds</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PaymentsWorkspace;
