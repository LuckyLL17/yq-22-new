import { Calendar, Users, MapPin, Phone, Clock, ChevronRight } from 'lucide-react';
import { Reservation, RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '@/types';
import { CountdownTimer } from './CountdownTimer';
import { useNavigate } from 'react-router-dom';

interface ReservationCardProps {
  reservation: Reservation;
  index?: number;
}

export function ReservationCard({ reservation, index = 0 }: ReservationCardProps) {
  const navigate = useNavigate();
  const {
    id,
    restaurantName,
    restaurantImage,
    restaurantAddress,
    reservationTime,
    guestCount,
    contactName,
    contactPhone,
    status,
    participantTastes,
    note,
  } = reservation;

  const isActive = status === 'pending' || status === 'confirmed';
  const date = new Date(reservationTime);
  const dateStr = date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in-up cursor-pointer ${
        status === 'cancelled' ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => navigate(`/reservation/${id}`)}
    >
      <div className="relative h-36 overflow-hidden">
        {restaurantImage ? (
          <img
            src={restaurantImage}
            alt={restaurantName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${RESERVATION_STATUS_COLORS[status]}`}>
            {RESERVATION_STATUS_LABELS[status]}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="font-display font-bold text-lg text-white">{restaurantName}</h3>
          {restaurantAddress && (
            <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
              <MapPin size={12} />
              <span className="truncate">{restaurantAddress}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {isActive && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <CountdownTimer targetTime={reservationTime} size="sm" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} className="text-primary-500" />
            <span className="truncate">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-orange-500" />
            <span>{timeStr}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} className="text-blue-500" />
            <span>{guestCount} 人</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} className="text-green-500" />
            <span className="truncate">{contactName}</span>
          </div>
        </div>

        {participantTastes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {participantTastes.slice(0, 5).map((p, i) => (
                  <div
                    key={p.personId}
                    className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center text-sm"
                    style={{ zIndex: 5 - i }}
                  >
                    {p.personAvatar}
                  </div>
                ))}
                {participantTastes.length > 5 && (
                  <div
                    className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500"
                    style={{ zIndex: 0 }}
                  >
                    +{participantTastes.length - 5}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {participantTastes.length} 人参加
              </span>
            </div>
          </div>
        )}

        {note && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 line-clamp-2">{note}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">查看详情</span>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
