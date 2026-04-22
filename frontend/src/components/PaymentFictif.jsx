import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCreditCard, FiLoader, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const PaymentFictif = () => {
  const { appointmentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const navigate = useNavigate();

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const patientToken = localStorage.getItem('patientToken');
      await axios.put(
        `${API_BASE_URL}/api/appointments/${appointmentId}/payment-status`,
        { payment_status: 'paid' },
        {
          headers: {
            Authorization: `Bearer ${patientToken}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      setPaid(true);
      setTimeout(() => {
        navigate('/my-appointments');
      }, 1200);
    } catch (err) {
      setError('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#f8fafc] via-[#e0e7ff] to-[#f0fdfa]">
      <div className="w-full max-w-lg">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-blue-100 p-0 overflow-hidden">
          {/* Top colored bar */}
          <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 flex items-center px-8">
            <FiCreditCard className="text-white w-10 h-10 mr-4" />
            <span className="text-white text-2xl font-bold tracking-wide">Paiement Consultation</span>
          </div>
          {/* Card content */}
          <div className="p-8 pt-6 flex flex-col items-center">
            <div className="w-full flex flex-col items-center mb-6">
              <span className="text-indigo-700 text-base font-semibold mb-2">Entrez vos informations bancaires</span>
              <div className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="Numéro de carte (ex: 4242 4242 4242 4242)"
                  value={cardNumber}
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
                    val = val.replace(/(.{4})/g, '$1 ').trim();
                    setCardNumber(val);
                  }}
                  className="w-full px-5 py-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-900 font-mono tracking-widest text-lg shadow-inner focus:ring-2 focus:ring-indigo-300 outline-none transition"
                  autoComplete="cc-number"
                />
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2);
                      setExpiry(val);
                    }}
                    className="w-1/2 px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-900 font-mono text-base shadow-inner focus:ring-2 focus:ring-indigo-300 outline-none transition"
                    autoComplete="cc-exp"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="CVV"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0,3))}
                    className="w-1/2 px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-900 font-mono text-base shadow-inner focus:ring-2 focus:ring-indigo-300 outline-none transition"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col items-center">
              {paid ? (
                <div className="flex flex-col items-center text-green-600 font-semibold text-lg mt-2 animate__animated animate__fadeInDown">
                  <div className="bg-green-100 p-3 rounded-full mb-2 animate-bounce">
                    <FiCheck className="w-7 h-7" />
                  </div>
                  <span>Paiement effectué</span>
                  <span className="text-green-700 text-xs mt-1 animate-pulse">Redirection vers vos rendez-vous...</span>
                </div>
              ) : (
                <>
                  <span className="mb-3 text-indigo-700 font-medium flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    Statut de paiement : <span className="underline">Non payé</span>
                  </span>
                  <button
                    onClick={handlePay}
                    className={`w-full px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition-all flex items-center justify-center ${
                      loading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <FiLoader className="animate-spin mr-2" /> Paiement...
                      </span>
                    ) : (
                      <>Payer maintenant</>
                    )}
                  </button>
                  {error && (
                    <div className="mt-4 text-red-600 text-sm flex items-center gap-2 animate__animated animate__shakeX">
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                      </svg>
                      {error}
                    </div>
                  )}
                  <div className="mt-6 w-full flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="10" />
                      </svg>
                      Paiement 100% sécurisé
                    </span>
                    <div className="flex gap-3 mt-1">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-7" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/MasterCard_Logo.svg" alt="Mastercard" className="h-7" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/CB_Carte_Bancaire_logo.svg" alt="CB" className="h-7" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFictif;
