import React from 'react';
import { MarketingProfile, MarketingCluster } from '../types';
import { MessageSquare, Linkedin, Mail, PhoneCall, Sparkles } from 'lucide-react';

interface MarketingChannelFunnelProps {
  profiles: MarketingProfile[];
  clusters: MarketingCluster[];
}

export const MarketingChannelFunnel: React.FC<MarketingChannelFunnelProps> = ({
  profiles,
  clusters
}) => {
  // Aggregate data by primary channel categories
  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Directo / Concierge',
      icon: MessageSquare,
      color: '#10B981', // Emerald
      personaTarget: 'Upsell VIP & Certificaciones',
      filter: (p: MarketingProfile) =>
        (p.recommendedChannel.toLowerCase().includes('whatsapp') ||
        p.marketingClusterCode === 'UPSELL_VIP' ||
        p.marketingClusterCode === 'CERT_BOOTCAMP') &&
        p.marketingClusterCode !== 'KIDS_JUNIOR'
    },
    {
      id: 'kids_family',
      name: 'Instagram & WhatsApp Familias',
      icon: MessageSquare,
      color: '#EC4899', // Pink / Fuchsia
      personaTarget: 'Enseñanza Infantil & Kids',
      filter: (p: MarketingProfile) =>
        p.marketingClusterCode === 'KIDS_JUNIOR' ||
        p.learningGoal === 'Enseñanza Infantil / Kids (4-12 años)' ||
        p.industry === 'Padres de Familia / Escolar'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn B2B & InMail',
      icon: Linkedin,
      color: '#0EA5E9', // Sky
      personaTarget: 'Corporativo & Ejecutivos',
      filter: (p: MarketingProfile) =>
        p.recommendedChannel.toLowerCase().includes('linkedin') ||
        p.marketingClusterCode === 'B2B_CORP'
    },
    {
      id: 'email',
      name: 'Email Automatizado & Nurturing',
      icon: Mail,
      color: '#8B5CF6', // Purple
      personaTarget: 'Viajeros & Exploradores Free',
      filter: (p: MarketingProfile) =>
        (p.recommendedChannel.toLowerCase().includes('email') ||
        p.marketingClusterCode === 'TRAVEL_CASUAL' ||
        p.marketingClusterCode === 'NURTURE_FREE') &&
        p.marketingClusterCode !== 'KIDS_JUNIOR'
    },
    {
      id: 'winback',
      name: 'Push App & Rescate Churn',
      icon: PhoneCall,
      color: '#F43F5E', // Rose
      personaTarget: 'Alumnos Inactivos (>45d)',
      filter: (p: MarketingProfile) =>
        p.marketingClusterCode === 'WINBACK_CHURN' ||
        (p.recencyDays > 45 && p.marketingClusterCode !== 'KIDS_JUNIOR')
    }
  ];

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Estrategia de Canales de Adquisición & Conversión
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Asignación inteligente del mejor canal de contacto según el perfil pedagógico y comercial.
          </p>
        </div>
        <span className="text-xs text-indigo-400 font-mono flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Matriz Multicanal</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {channels.map(channel => {
          const matched = profiles.filter(channel.filter);
          const count = matched.length;
          const share = profiles.length > 0 ? Math.round((count / profiles.length) * 100) : 0;
          const totalLTV = matched.reduce((acc, p) => acc + p.expectedLTV, 0);
          const avgConv = count > 0 ? Math.round(matched.reduce((acc, p) => acc + p.conversionProbability, 0) / count) : 0;
          const Icon = channel.icon;

          return (
            <div
              key={channel.id}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${channel.color}20`, color: channel.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {channel.name}
                  </h4>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Foco: <span className="text-slate-200 font-medium">{channel.personaTarget}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Leads Asignados</span>
                  <strong className="text-white font-bold">{count} ({share}%)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Conv. Media</span>
                  <strong className="text-emerald-400 font-bold">{avgConv}%</strong>
                </div>
              </div>

              <div className="text-[11px] font-mono pt-1 text-slate-300 flex justify-between">
                <span className="text-slate-500">Pipeline Valor:</span>
                <span className="font-bold text-white">${(totalLTV / 1000).toFixed(1)}k</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
