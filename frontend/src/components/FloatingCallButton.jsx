import React from "react";
import { Phone } from "lucide-react";

const FloatingCallButton = () => (
  <a href="tel:9935363400" className="floating-call" aria-label="Call 9935363400">
    <span className="floating-call__ring" aria-hidden="true" />
    <span className="floating-call__icon">
      <Phone size={22} strokeWidth={2.4} />
    </span>
    <span className="floating-call__label">Call Now</span>
  </a>
);

export default FloatingCallButton;
