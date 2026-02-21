import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export default function MenuHeader({ menu }) {
  return (
    <div className="relative">
      <img
        src={menu?.image_url || 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80'}
        alt={menu?.name_th || 'เมนู'}
        className="w-full h-48 object-cover rounded-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-2xl" />
      
      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
        <Sparkles className="w-3 h-3 mr-1" />
        AI ปรับสูตร
      </Badge>
      
      <div className="absolute bottom-4 left-4 right-4">
        <h1 className="text-2xl font-bold text-white mb-1">
          {menu?.name_th || 'ส้มตำปลาร้า'}
        </h1>
        <p className="text-white/90 text-sm">✨ เวอร์ชันสุขภาพ</p>
      </div>
    </div>
  );
}