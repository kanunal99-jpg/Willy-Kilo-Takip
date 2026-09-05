import React, { useState } from 'react';
import { Bot, Send, CheckCircle2, Award, Loader2 } from 'lucide-react';
import { DailyData, UserProfile } from '../types';

interface WillyCoachTabProps {
  profile: UserProfile;
  todayData: DailyData;
  activeFast: any;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const WillyCoachTab: React.FC<WillyCoachTabProps> = ({ profile, todayData, activeFast }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'willy' | 'user'; text: string; time: string }>>([
    {
      sender: 'willy',
      text: `Merhaba ${profile.name}! Ben kişisel beslenme ve kilo koçun Willy. Bugün ${todayData.entries.reduce((s, e) => s + e.calories, 0)} kcal tükettin ve ${(todayData.waterIntakeMl / 1000).toFixed(2)}L su içtin. Bugün hedefine ulaşman için neye ihtiyacın var?`,
      time: 'Şimdi',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const consumedCalories = todayData.entries.reduce((s, e) => s + e.calories, 0);
  const burnedCalories = todayData.exercises.reduce((s, e) => s + e.caloriesBurned, 0);
  const quickQuestions = ['Bugün akşam yemeğinde ne yemeliyim?', 'Kilo vermem yavaşladı, ne yapabilirim?', 'Oruç penceresinde kahve içebilir miyim?', 'Protein hedefimi nasıl tamamlarım?'];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isLoading) return;

    const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: query, time: now }]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userProfile: profile,
          todaySummary: {
            consumedCalories,
            burnedCalories,
            waterMl: todayData.waterIntakeMl,
            fastingActive: !!activeFast,
          },
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success || !json.reply) {
        throw new Error(json.error || `AI servisi HTTP ${res.status}`);
      }

      setMessages((prev) => [...prev, {
        sender: 'willy',
        text: json.reply,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, {
        sender: 'willy',
        text: `AI koç şu anda yanıt üretemedi. ${error?.message ? `Sunucu: ${error.message}` : 'Bağlantını kontrol edip tekrar dene.'}`,
        time: 'Şimdi',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-500/40 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400"><Award className="w-6 h-6 text-emerald-400" /></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Willy PRO Avantajları</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">Ömür Boyu Ücretsiz Aktif</span>
              </div>
              <p className="text-xs text-slate-300">Yazio'nun tüm ücretli modülleri kilitsizdir.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800/80">
          {['Sınırsız AI Fotoğraf', 'Aralıklı Oruç (Tüm Planlar)', 'Akıllı Barkod Tarayıcı', 'Güvenli Bulut Eşitleme'].map((perk) => (
            <div key={perk} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span className="text-[11px] text-slate-200 font-medium">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 flex flex-col h-[460px] shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><Bot className="w-4 h-4" /></div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">Willy AI Beslenme Koçu <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /></h4>
              <p className="text-[10px] text-emerald-400">Çevrimiçi • Gerçek Gemini AI Koçu</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none shadow-sm'}`}>{m.text}</div>
              <span className="text-[9px] text-slate-500 px-1 mt-1">{m.time}</span>
            </div>
          ))}
          {isLoading && <div className="flex items-center gap-2 text-xs text-slate-400 p-2"><Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /><span>Willy yanıt yazıyor...</span></div>}
        </div>

        <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800 flex gap-1.5 overflow-x-auto">
          {quickQuestions.map((q) => <button key={q} onClick={() => handleSendMessage(q)} disabled={isLoading} className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 whitespace-nowrap transition cursor-pointer disabled:opacity-50">{q}</button>)}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Willy'ye beslenme veya kilon hakkında bir şey sor..." className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          <button onClick={() => handleSendMessage()} disabled={isLoading || !inputText.trim()} className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 transition shadow-md shadow-emerald-500/20 cursor-pointer"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
