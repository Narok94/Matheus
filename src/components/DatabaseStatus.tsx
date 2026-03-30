import React, { useEffect, useState } from 'react';

export const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error' | 'not-configured'>('loading');
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/db-test');
        const data = await response.json();
        
        if (response.ok && data.status === 'connected') {
          setStatus('connected');
          setTime(data.time);
        } else if (data.error && data.error.includes('DATABASE_URL')) {
          setStatus('not-configured');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    checkConnection();
  }, []);

  if (status === 'loading') return <div className="text-xs text-text-secondary">Verificando banco...</div>;
  
  if (status === 'not-configured') {
    return (
      <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-500">
        Neon não configurado. Adicione DATABASE_URL.
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
        Erro na conexão com Neon.
      </div>
    );
  }

  return (
    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-500">
      Conectado ao Neon! <br/>
      <span className="opacity-70">Hora: {new Date(time!).toLocaleTimeString()}</span>
    </div>
  );
};
