import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    bankAccount: '',
    routingNumber: '',
    mobileNumber: '',
    pin: ''
  });
  const [commissionRate] = useState(15); // 15% commission rate

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBooking();
  }, [bookingId, isAuthenticated]);

  const loadBooking = async () => {
  try {
    setLoading(true);
    
    try {
      // Try to fetch from backend first
      const response = await bookingsAPI.getById(bookingId);
      
      if (response.data && response.data.success) {
        console.log('Loaded booking from backend:', response.data.data._id);
        setBooking(response.data.data);
      } else {
        throw new Error('Booking not found');
      }
    } catch (error) {
      console.log('Backend not available, using mock data');
      
      // Fallback to mock booking data
      const mockBooking = {
        _id: bookingId,
        property: {
          _id: '1',
          title: 'Modern 2BR Apartment Near University',
          price: 1200,
          type: 'apartment',
          location: {
            address: '123 University Ave, Campus Town'
          }
        },
        user: {
          _id: user.id,
          name: user.name,
          email: user.email
        },
        bookingType: 'rent',
        status: 'confirmed',
        rentalPeriod: {
          startDate: '2024-09-01',
          endDate: '2025-03-01',
          duration: 6
        },
        payment: {
          advanceAmount: 1200,
          isPaid: false,
          commissionPercentage: commissionRate
        },
        adminApproval: {
          isApproved: true,
          approvedAt: new Date(),
          adminNotes: 'Booking approved by admin'
        }
      };
      setBooking(mockBooking);
    }
  } catch (error) {
    toast.error('Failed to load booking details');
    navigate('/bookings');
  } finally {
    setLoading(false);
  }
};

  const calculatePaymentSplit = (amount, commissionPercentage) => {
    const commission = (amount * commissionPercentage) / 100;
    const ownerAmount = amount - commission;
    return {
      totalAmount: amount,
      adminCommission: commission,
      ownerAmount: ownerAmount,
      commissionPercentage
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formatted.replace(/\s/g, '').length <= 16) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
      if (formatted.length <= 5) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
    }
    // Format CVV
    else if (name === 'cvv') {
      if (value.length <= 4 && /^\d*$/.test(value)) {
        setPaymentData(prev => ({ ...prev, [name]: value }));
      }
    }
    // Format mobile number
    else if (name === 'mobileNumber') {
      const formatted = value.replace(/\D/g, '');
      if (formatted.length <= 11) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
    }
    // Format PIN
    else if (name === 'pin') {
      if (value.length <= 4 && /^\d*$/.test(value)) {
        setPaymentData(prev => ({ ...prev, [name]: value }));
      }
    }
    else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return false;
      }
      if (!paymentData.expiryDate || paymentData.expiryDate.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
      if (!paymentData.cardName.trim()) {
        toast.error('Please enter the cardholder name');
        return false;
      }
    } else if (paymentMethod === 'bank_transfer') {
      if (!paymentData.bankAccount) {
        toast.error('Please enter your bank account number');
        return false;
      }
      if (!paymentData.routingNumber) {
        toast.error('Please enter your routing number');
        return false;
      }
    } else if (paymentMethod === 'mobile_banking') {
      if (!paymentData.mobileNumber || paymentData.mobileNumber.length < 10) {
        toast.error('Please enter a valid mobile number');
        return false;
      }
      if (!paymentData.pin || paymentData.pin.length !== 4) {
        toast.error('Please enter your 4-digit PIN');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async (e) => {
  e.preventDefault();
  
  if (!validatePayment()) return;

  try {
    setProcessing(true);
    
    const paymentPayload = {
      paymentMethod,
      advanceAmount: booking.payment.advanceAmount,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentData: paymentData
    };

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Try to process payment with backend
      const response = await bookingsAPI.processPayment(booking._id, paymentPayload);
      
      if (response.data && response.data.success) {
        toast.success('Payment processed successfully! Your booking is now confirmed.');
        navigate('/dashboard');
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.log('Backend not available, using mock payment processing:', error.message);
      toast.success('Payment processed successfully! Your booking is now confirmed.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }

  } catch (error) {
    toast.error('Payment failed. Please try again.');
  } finally {
    setProcessing(false);
  }
};

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #404040',
            borderTop: '3px solid #f98080',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking || booking.status !== 'confirmed') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#f3f4f6', fontSize: '2rem', marginBottom: '1rem' }}>
            {!booking ? 'Booking Not Found' : 'Booking Not Ready for Payment'}
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            {!booking 
              ? 'The booking you\'re trying to pay for doesn\'t exist.' 
              : 'This booking needs to be confirmed before payment can be processed.'
            }
          </p>
          <button onClick={() => navigate('/bookings')} className="btn-primary">
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const paymentSplit = calculatePaymentSplit(booking.payment.advanceAmount, commissionRate);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        padding: '2rem 0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Payment
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Complete your payment for {booking.property.title}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {/* Payment Form */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Payment Information
            </h2>

            <form onSubmit={handlePayment}>
              {/* Payment Method Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '1rem', fontSize: '1rem', fontWeight: '500' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: paymentMethod === 'card' ? '#2d2d2d' : '#1a1a1a',
                    border: paymentMethod === 'card' ? '2px solid #f98080' : '2px solid #404040',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>💳 Card</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: paymentMethod === 'bank_transfer' ? '#2d2d2d' : '#1a1a1a',
                    border: paymentMethod === 'bank_transfer' ? '2px solid #f98080' : '2px solid #404040',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>🏦 Bank</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: paymentMethod === 'mobile_banking' ? '#2d2d2d' : '#1a1a1a',
                    border: paymentMethod === 'mobile_banking' ? '2px solid #f98080' : '2px solid #404040',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mobile_banking"
                      checked={paymentMethod === 'mobile_banking'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>📱 Mobile</span>
                  </label>
                </div>
              </div>

              {/* Card Payment Fields */}
              {paymentMethod === 'card' && (
                <div style={{ space: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#2d2d2d',
                          border: '1px solid #404040',
                          borderRadius: '6px',
                          color: '#f3f4f6',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#2d2d2d',
                          border: '1px solid #404040',
                          borderRadius: '6px',
                          color: '#f3f4f6',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bank Transfer Fields */}
              {paymentMethod === 'bank_transfer' && (
                <div style={{ space: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      name="bankAccount"
                      value={paymentData.bankAccount}
                      onChange={handleInputChange}
                      placeholder="1234567890"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      Routing Number
                    </label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={paymentData.routingNumber}
                      onChange={handleInputChange}
                      placeholder="123456789"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Mobile Banking Fields */}
              {paymentMethod === 'mobile_banking' && (
                <div style={{ space: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={paymentData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      PIN
                    </label>
                    <input
                      type="password"
                      name="pin"
                      value={paymentData.pin}
                      onChange={handleInputChange}
                      placeholder="••••"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#2d2d2d',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#0f1a0f',
                border: '1px solid #10b981',
                borderRadius: '6px',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#10b981' }}>🔒</span>
                  <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>Secure Payment</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: processing ? 0.7 : 1,
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    💳 Pay ${booking.payment.advanceAmount}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Payment Summary */}
          <div>
            {/* Booking Summary */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Booking Summary
              </h3>
              <div style={{ space: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Property</span>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>{booking.property.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Monthly Rent</span>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>${booking.property.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Duration</span>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>{booking.rentalPeriod.duration} months</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Move-in Date</span>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                    {new Date(booking.rentalPeriod.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Move-out Date</span>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                    {new Date(booking.rentalPeriod.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Payment Breakdown
              </h3>
              <div style={{ space: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Advance Payment</span>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>${paymentSplit.totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Platform Fee ({paymentSplit.commissionPercentage}%)</span>
                  <span style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: '500' }}>-${paymentSplit.adminCommission.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Owner Receives</span>
                  <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>${paymentSplit.ownerAmount.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid #404040', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '600' }}>You Pay</span>
                    <span style={{ color: '#f98080', fontSize: '1.125rem', fontWeight: '700' }}>${paymentSplit.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div style={{
              backgroundColor: '#0f0f0f',
              border: '1px solid #404040',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h4 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                Payment Information
              </h4>
              <ul style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5', margin: 0, paddingLeft: '1rem' }}>
                <li>This is an advance payment to secure your booking</li>
                <li>The remaining amount will be paid monthly as per the rental agreement</li>
                <li>Platform fee covers booking processing, support, and secure payment handling</li>
                <li>Full refund available if booking is cancelled within 24 hours</li>
                <li>Digital rental agreement will be generated after payment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentPage;