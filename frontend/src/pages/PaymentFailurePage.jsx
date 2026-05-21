import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <XCircle size={64} color="#ef4444" style={{ margin: '0 auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1.5rem', color: '#111827' }}>Payment Failed or Cancelled</h2>
        <p style={{ color: '#4b5563', marginTop: '1rem', lineHeight: '1.5' }}>
          Your payment could not be processed successfully. Please ensure you have sufficient balance and try again.
        </p>
        <button 
          onClick={() => navigate('/tutor/verify')}
          style={{ marginTop: '2rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 2rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'transform 0.2s', width: '100%' }}
        >
          Return to Verification Page
        </button>
      </div>
    </div>
  );
}
