"use client"

import { 
  PaymentStatus, 
  FulfillmentStatus, 
  toUiState, 
  uiColorClasses, 
  uiIcon 
} from '@/lib/orderStatus';
import { CheckCircle, Truck, Package, Clock, XCircle, Ban, HelpCircle } from 'lucide-react';

export interface StatusBadgeProps {
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  className?: string;
  showIcon?: boolean;
}

/**
 * Componente React para mostrar el estado de la orden
 */
export function StatusBadge({ 
  paymentStatus, 
  fulfillmentStatus, 
  className = '', 
  showIcon = true 
}: StatusBadgeProps) {
  const state = toUiState(paymentStatus, fulfillmentStatus);
  const classes = uiColorClasses(state);
  const iconName = uiIcon(state);
  
  const getIcon = (name: string) => {
    switch (name) {
      case 'CheckCircle': return <CheckCircle className="w-4 h-4" />;
      case 'Truck': return <Truck className="w-4 h-4" />;
      case 'Package': return <Package className="w-4 h-4" />;
      case 'Clock': return <Clock className="w-4 h-4" />;
      case 'XCircle': return <XCircle className="w-4 h-4" />;
      case 'Ban': return <Ban className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-sm font-medium ${classes} ${className}`}>
      {showIcon && getIcon(iconName)}
      {state}
    </span>
  );
}

export default StatusBadge;
