import React, { useRef, useState, useEffect } from 'react';
import './CertificateTemplate.css';
import bgImage from '../../assets/certificate/background_bg.png';
import logoImage from '../../assets/certificate/logo.png';

const CertificateTemplate = ({ 
  learnerName = "NSHIMYUMUREMYI Olivier",
  courseName = "Cybersecurity Workshop",
  programTitle = "SSL/TLS: Securing Communication on the Internet",
  duration = "1.5-Hour",
  description = "This workshop covered SSL/TLS fundamentals, the basics of cryptography, SSL certificates, TLS handshakes, HTTPS communication, encryption, certificate authorities, and practical laboratory exercises.",
  instructorName = "Jean Chrysostome ND",
  issueDate = "15 July 2026",
  certificateID = "TL-2026-000001",
  verificationURL = "https://academy.trusterlabs.com/certificate/TL-2026-000001"
}) => {
  // Generate QR code URL using an external service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(verificationURL)}`;
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const containerWidth = wrapperRef.current.clientWidth;
        // Check if we are printing - avoid scaling for print
        const isPrint = window.matchMedia('print').matches;
        if (isPrint) {
          setScale(1);
          return;
        }
        
        // Target native width is 1123. Scale down if container is smaller.
        // Multiply by 0.95 to give a small 5% padding so it doesn't touch the exact edges on small screens.
        const newScale = Math.min((containerWidth * 0.95) / 1123, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    // Also listen to print media query to reset scale when printing
    const mediaQueryList = window.matchMedia('print');
    const printListener = (mql) => {
      if (mql.matches) {
        setScale(1);
      } else {
        updateScale();
      }
    };
    mediaQueryList.addEventListener('change', printListener);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      mediaQueryList.removeEventListener('change', printListener);
    };
  }, []);

  return (
    <div className="certificate-wrapper" ref={wrapperRef}>
      <div 
        className="certificate-scaler"
        style={{
          width: `${1123 * scale}px`,
          height: `${794 * scale}px`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          className="certificate"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1123px',
            height: '794px'
          }}
        >
            {/* Background Image */}
            <img
                src={bgImage}
                className="background"
                alt="Certificate Background"
            />

            {/* Header */}
            <div className="header">
                <h1>TRUSTERLABS ACADEMY</h1>
                <p>
                    Cybersecurity Excellence |
                    Built for Africa
                </p>
            </div>

            {/* Certificate Title */}
            <h2 className="certificate-title">
                CERTIFICATE
            </h2>

            <h3 className="certificate-type">
                OF PARTICIPATION
            </h3>

            <p className="award-text">
                This Certificate is Proudly Awarded to
            </p>

            {/* Student Name */}
            <h1 className="student-name">
                {learnerName}
            </h1>

            <hr />

            {/* Course */}
            <div className="course">
                <p>
                    For successful participation in a{" "}
                    <span>{duration}</span>{" "}
                    Online{" "}
                    <span>{courseName}</span>
                </p>
                <h2>{programTitle}</h2>
            </div>

            {/* Covered Paragraph */}
            <div className="covered">
                <p>{description}</p>
            </div>

            {/* Issued */}
            <div className="issued">
                Issued by TrusterLabs Academy,
                Kigali, Rwanda
            </div>

            {/* Bottom Section */}
            <div className="bottom">
                {/* Instructor */}
                <div className="signature">
                    <div className="signature-placeholder"></div>
                    <h4>{instructorName}</h4>
                    <p>Instructor</p>
                </div>

                {/* Center */}
                <div className="center">
                    {/* QR Code and Details */}
                    <div className="qr-details">
                        <div className="qr-detail-left">
                            <strong>Certificate ID</strong>
                            <p>{certificateID}</p>
                        </div>
                        
                        <div id="qrcode">
                            <img src={qrCodeUrl} alt="QR Code" />
                        </div>
                        
                        <div className="qr-detail-right">
                            <strong>Completed</strong>
                            <p>{issueDate}</p>
                        </div>
                    </div>

                    {/* Logo */}
                    <img
                        src={logoImage}
                        className="logo"
                        alt="TrusterLabs Logo"
                    />
                </div>

                {/* CEO */}
                <div className="signature">
                    <div className="signature-placeholder"></div>
                    <h4>Mr. Dominique HARELIMANA</h4>
                    <p>Chief Executive Officer</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
