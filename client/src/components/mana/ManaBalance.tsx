import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const ManaBalance: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  
  const { data, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/user/mana'],
    enabled: !!user,
  });

  const isLoading = authLoading || balanceLoading;
  const balance = data?.balance || 0;
  
  if (!user) {
    return null;
  }
  
  return (
    <Badge variant="outline" className="bg-gradient-to-r from-blue-900 to-purple-900 text-white flex items-center gap-1 py-1 px-3">
      <Sparkles className="h-4 w-4 text-blue-300" />
      <span className="text-yellow-300 font-bold">{isLoading ? '...' : balance}</span>
      <span className="ml-1">Mana</span>
    </Badge>
  );
};

export default ManaBalance;