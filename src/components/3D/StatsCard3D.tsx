import React, { useState, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';

interface StatsCard3DProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
}

export function StatsCard3D({ title, value, change, icon, color, onClick }: StatsCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const colorGradients = {
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
    purple: 'from-purple-600 to-pink-600',
    orange: 'from-orange-600 to-red-600',
    red: 'from-red-600 to-pink-600',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 8;
    const rotateY = (centerX - x) / 8;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="perspective-1000">
      <div
        ref={cardRef}
        className="relative w-full h-48 transition-all duration-300 transform-gpu cursor-pointer"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.08 : 1})`,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* Main Card */}
        <div 
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorGradients[color]} shadow-2xl p-6 text-white`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'translateZ(15px)',
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {icon}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                change >= 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
              }`}>
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change)}%
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-3xl font-bold mb-1">
                {value}
              </div>
              <div className="text-sm text-white/80">
                {title}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Depth Effect */}
        <div 
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorGradients[color]} opacity-50`}
          style={{
            transform: 'translateZ(-5px) scale(0.98)',
          }}
        />
        
        {/* Shadow */}
        <div 
          className="absolute inset-0 rounded-2xl bg-black/30 blur-xl"
          style={{
            transform: 'translateZ(-20px) scale(0.95)',
          }}
        />

        {/* Floating Particles */}
        {isHovered && (
          <>
            <div 
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-pulse"
              style={{
                top: '20%',
                left: '10%',
                transform: 'translateZ(30px)',
              }}
            />
            <div 
              className="absolute w-3 h-3 bg-white/30 rounded-full animate-pulse"
              style={{
                top: '60%',
                right: '15%',
                transform: 'translateZ(25px)',
                animationDelay: '0.5s',
              }}
            />
            <div 
              className="absolute w-1 h-1 bg-white/50 rounded-full animate-pulse"
              style={{
                bottom: '20%',
                left: '20%',
                transform: 'translateZ(35px)',
                animationDelay: '1s',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

// Pre-configured stat cards
export function RevenueCard3D({ value, change, onClick }: { value: string | number; change: number; onClick?: () => void }) {
  return (
    <StatsCard3D
      title="Bugungi Daromad"
      value={value}
      change={change}
      icon={<DollarSign className="w-5 h-5" />}
      color="green"
      onClick={onClick}
    />
  );
}

export function SalesCard3D({ value, change, onClick }: { value: string | number; change: number; onClick?: () => void }) {
  return (
    <StatsCard3D
      title="Sotuvlar"
      value={value}
      change={change}
      icon={<ShoppingCart className="w-5 h-5" />}
      color="blue"
      onClick={onClick}
    />
  );
}

export function ProductsCard3D({ value, change, onClick }: { value: string | number; change: number; onClick?: () => void }) {
  return (
    <StatsCard3D
      title="Mahsulotlar"
      value={value}
      change={change}
      icon={<Package className="w-5 h-5" />}
      color="purple"
      onClick={onClick}
    />
  );
}

export function CustomersCard3D({ value, change, onClick }: { value: string | number; change: number; onClick?: () => void }) {
  return (
    <StatsCard3D
      title="Mijozlar"
      value={value}
      change={change}
      icon={<Users className="w-5 h-5" />}
      color="orange"
      onClick={onClick}
    />
  );
}
