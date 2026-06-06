import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  User,
  Phone,
  MapPin,
  FileText,
  Edit3,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Bell,
  Flame,
  Leaf,
  Ban,
  Heart,
  ChefHat,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ReservationForm } from '@/components/ReservationForm';
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  SPICY_LABELS,
} from '@/types';

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReservation, cancelReservation, deleteReservation, confirmReservation, completeReservation, sendReminder } = useStore();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const reservation = getReservation(id || '');

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={36} className="text-gray-400" />
          </div>
          <h2 className="font-display font-bold text-xl text-gray-800 mb-2">预约不存在</h2>
          <p className="text-gray-500 mb-6">该预约可能已被删除</p>
          <Link
            to="/reservations"
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            返回预约列表
          </Link>
        </div>
      </div>
    );
  }

  const {
    restaurantName,
    restaurantImage,
    restaurantAddress,
    reservationTime,
    guestCount,
    contactName,
    contactPhone,
    note,
    status,
    participantTastes,
    reminderSent,
  } = reservation;

  const isActive = status === 'pending' || status === 'confirmed';
  const date = new Date(reservationTime);
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCancel = () => {
    cancelReservation(reservation.id);
    setShowCancelConfirm(false);
  };

  const handleDelete = () => {
    deleteReservation(reservation.id);
    navigate('/reservations');
  };

  const handleConfirm = () => {
    confirmReservation(reservation.id);
  };

  const handleComplete = () => {
    completeReservation(reservation.id);
  };

  const handleSendReminder = () => {
    sendReminder(reservation.id);
  };

  if (showEditForm) {
    return (
      <div className="min-h-screen pb-20 bg-gray-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowEditForm(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回</span>
              </button>
              <h1 className="font-display font-bold text-xl text-gray-800">修改预约</h1>
              <div className="w-16" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <ReservationForm
            reservation={reservation}
            onSubmit={() => setShowEditForm(false)}
            onCancel={() => setShowEditForm(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/reservations')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <h1 className="font-display font-bold text-xl text-gray-800">预约详情</h1>
            <button
              onClick={() => setShowEditForm(true)}
              className="flex items-center gap-1 text-primary-500 hover:text-primary-600 transition-colors"
            >
              <Edit3 size={18} />
              <span className="text-sm font-medium">编辑</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl overflow-hidden card-shadow animate-fade-in-up">
          <div className="relative h-48 overflow-hidden">
            {restaurantImage ? (
              <img
                src={restaurantImage}
                alt={restaurantName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center">
                <span className="text-7xl">🍽️</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${RESERVATION_STATUS_COLORS[status]}`}>
                {RESERVATION_STATUS_LABELS[status]}
              </span>
            </div>
            {reminderSent && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                  <Bell size={12} />
                  已提醒
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h2 className="font-display font-bold text-2xl text-white">{restaurantName}</h2>
              {restaurantAddress && (
                <div className="flex items-center gap-2 text-white/80 mt-2">
                  <MapPin size={16} />
                  <span>{restaurantAddress}</span>
                </div>
              )}
            </div>
          </div>

          {isActive && (
            <div className="p-6 bg-gradient-to-r from-primary-50 to-orange-50 border-b border-gray-100">
              <CountdownTimer targetTime={reservationTime} size="lg" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-500" />
            预约信息
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar size={16} />
                <span>日期</span>
              </div>
              <p className="font-medium text-gray-800">{dateStr}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Clock size={16} />
                <span>时间</span>
              </div>
              <p className="font-medium text-gray-800">{timeStr}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Users size={16} />
                <span>人数</span>
              </div>
              <p className="font-medium text-gray-800">{guestCount} 人</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <ChefHat size={16} />
                <span>参加人数</span>
              </div>
              <p className="font-medium text-gray-800">{participantTastes.length} 人</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-green-500" />
            联系方式
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <User size={16} />
                <span>联系人</span>
              </div>
              <p className="font-medium text-gray-800">{contactName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Phone size={16} />
                <span>电话</span>
              </div>
              <p className="font-medium text-gray-800">{contactPhone}</p>
            </div>
          </div>
        </div>

        {participantTastes.length > 0 && (
          <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-500" />
              参加人员口味
            </h3>
            <div className="space-y-3">
              {participantTastes.map(person => (
                <div key={person.personId} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{person.personAvatar}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{person.personName}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="tag bg-orange-100 text-orange-700 text-xs flex items-center gap-1">
                          <Flame size={10} />
                          {SPICY_LABELS[person.spicyLevel]}
                        </span>
                        {person.isVegetarian && (
                          <span className="tag bg-green-100 text-green-700 text-xs flex items-center gap-1">
                            <Leaf size={10} />
                            素食
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {person.dislikes.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Ban size={12} className="text-red-400" />
                        忌口
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {person.dislikes.map(item => (
                          <span key={item} className="tag bg-red-50 text-red-600 text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {person.allergies.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <AlertTriangle size={12} className="text-purple-400" />
                        过敏
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {person.allergies.map(item => (
                          <span key={item} className="tag bg-purple-50 text-purple-600 text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {person.favorites.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Heart size={12} className="text-pink-400" />
                        喜欢
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {person.favorites.map(item => (
                          <span key={item} className="tag bg-pink-50 text-pink-600 text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {note && (
          <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-yellow-500" />
              备注
            </h3>
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{note}</p>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-4xl mx-auto flex gap-3">
          {isActive && (
            <>
              <button
                onClick={handleSendReminder}
                disabled={reminderSent}
                className="flex-1 py-4 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bell size={20} />
                {reminderSent ? '已提醒' : '发送提醒'}
              </button>
              
              {status === 'pending' && (
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-4 rounded-xl bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  确认预约
                </button>
              )}
              
              {status === 'confirmed' && (
                <button
                  onClick={handleComplete}
                  className="flex-1 py-4 rounded-xl bg-purple-50 text-purple-600 font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  完成聚餐
                </button>
              )}
              
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 py-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                取消预约
              </button>
            </>
          )}
          
          {!isActive && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 py-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              删除预约
            </button>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-800 mb-2">确认取消预约？</h3>
              <p className="text-gray-500">
                取消后将无法恢复，确定要取消 {restaurantName} 的预约吗？
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                再想想
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-800 mb-2">确认删除预约？</h3>
              <p className="text-gray-500">
                删除后将无法恢复，确定要删除这条预约记录吗？
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
