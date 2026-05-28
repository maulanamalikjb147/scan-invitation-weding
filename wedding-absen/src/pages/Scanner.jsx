import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../supabaseClient'

function Scanner() {
  const [scanning, setScanning] = useState(false)
  const [welcomeData, setWelcomeData] = useState(null)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  const startScanner = async () => {
    try {
      setScanning(true)
      setError(null)
      
      html5QrCodeRef.current = new Html5Qrcode("qr-reader")
      
      await html5QrCodeRef.current.start(
        { 
          facingMode: "environment",
          aspectRatio: 1.0
        },
        {
          fps: 30,  // 3x lebih cepat dari sebelumnya (10 fps)
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            // Dynamic qrbox size based on screen
            let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            let qrboxSize = Math.floor(minEdge * 0.8);  // 80% of viewport
            return {
              width: qrboxSize,
              height: qrboxSize
            };
          },
          aspectRatio: 1.0,
          disableFlip: false,  // Allow flipped QR codes
          videoConstraints: {
            advanced: [{ zoom: 1.0 }]
          }
        },
        onScanSuccess,
        onScanError
      )
    } catch (err) {
      console.error("Failed to start scanner:", err)
      setError("Gagal memulai scanner. Pastikan kamera diizinkan.")
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
    setScanning(false)
  }

  const onScanSuccess = async (decodedText) => {
    try {
      // Pause scanning temporarily to prevent multiple scans
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.pause()
      }
      
      // Parse QR code data
      const guestData = JSON.parse(decodedText)
      const { id, nama_tamu, alamat_tamu } = guestData

      // Update database
      const { error: updateError } = await supabase
        .from('data_tamu')
        .update({ 
          hadir: true, 
          checkin: new Date().toISOString() 
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      // Show welcome message
      setWelcomeData({
        nama: nama_tamu,
        alamat: alamat_tamu
      })

      // Auto close and resume scanning after 5 seconds
      setTimeout(() => {
        setWelcomeData(null)
        // Resume scanning after popup closes
        if (html5QrCodeRef.current && scanning) {
          html5QrCodeRef.current.resume()
        }
      }, 5000)
    } catch (err) {
      console.error("Error processing QR code:", err)
      setError("QR code tidak valid atau terjadi kesalahan")
      setTimeout(() => {
        setError(null)
        // Resume scanning after error
        if (html5QrCodeRef.current && scanning) {
          html5QrCodeRef.current.resume()
        }
      }, 3000)
    }
  }

  const onScanError = (errorMessage) => {
    // Ignore continuous scan errors
  }

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        stopScanner()
      }
    }
  }, [])

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
          Wedding Check-in
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Scan QR code untuk check-in
        </p>

        <div id="qr-reader" style={{ 
          borderRadius: '16px', 
          overflow: 'hidden', 
          marginBottom: '1rem',
          display: scanning ? 'block' : 'none',
          boxShadow: scanning ? '0 0 20px rgba(102, 126, 234, 0.3)' : 'none',
          border: scanning ? '3px solid #667eea' : 'none'
        }}></div>

        {scanning && (
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            padding: '0.75rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            color: '#667eea',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>
            📸 Arahkan kamera ke QR code...
          </div>
        )}

        {!scanning && !welcomeData && (
          <button 
            className="btn-primary" 
            onClick={startScanner}
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem' }}
          >
            🎥 Mulai Scan QR Code
          </button>
        )}

        {scanning && (
          <button 
            className="btn-secondary" 
            onClick={stopScanner}
            style={{ width: '100%', padding: '1rem' }}
          >
            ❌ Berhenti Scan
          </button>
        )}

        {error && (
          <div style={{ 
            background: '#ffe5e5', 
            color: '#ff4757', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginTop: '1rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Welcome Modal */}
      {welcomeData && (
        <div className="modal-overlay" onClick={() => {
          setWelcomeData(null)
          // Resume scanning when modal closed
          if (html5QrCodeRef.current && scanning) {
            html5QrCodeRef.current.resume()
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea', marginBottom: '0.5rem' }}>
              Welcome!
            </h2>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
              {welcomeData.nama}
            </h3>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
              📍 {welcomeData.alamat}
            </p>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              padding: '1rem 2rem', 
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Enjoy with our wedding! 💕
            </div>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setWelcomeData(null)
                // Resume scanning when button clicked
                if (html5QrCodeRef.current && scanning) {
                  html5QrCodeRef.current.resume()
                }
              }}
              style={{ marginTop: '1rem' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scanner
