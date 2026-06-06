import { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, CheckCircle, XCircle, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ReservationCard } from '@/components/ReservationCard';
import { ReservationForm } from '@/components/ReservationForm';
import { ReservationStatus } from '@/types';

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function Reservations() {
  const { reservations } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs: { key: TabType; label: string; icon: typeof Calendar }[] = [
    { key: 'all', label: '全部', icon: ListTodo },
    { key: 'upcoming', label: '即将到来', icon: Calendar },
    { key: 'completed', label: '已完成', icon: CheckCircle },
    { key: 'cancelled', label: '已取消', icon: XCircle },
  ];

  const filteredReservations = useMemo(() => {
    const now = Date.now();
    
    switch (activeTab) {
      case 'upcoming':
        return reservations.filter(
          r => (r.status === 'pending' || r.status === 'confirmed') && r.reservationTime > now
        );
      case 'completed':
        return reservations.filter(r => r.status === 'completed');
      case 'cancelled':
        return reservations.filter(r => r.status === 'cancelled');
      default:
        return reservations;
    }
  }, [reservations, activeTab]);

  const upcomingCount = reservations.filter(
    r => (r.status === 'pending' || r.status === 'confirmed') && r.reservationTime > Date.now()
  ).length;

  const tabCounts = useMemo(() => ({
    all: reservations.length,
    upcoming: upcomingCount,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  }), [reservations, upcomingCount]);

  const handleFormSubmit = () => {
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen pb-20 bg-gray-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回</span>
              </button>
              <h1 className="font-display font-bold text-xl text-gray-800">新建预约</h1>
              <div className="w-16" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <ReservationForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </Link>
            <h1 className="font-display font-bold text-xl text-gray-800">餐厅预约</h1>
            <div className="w-16" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {upcomingCount > 0 && activeTab === 'all' && (
          <div className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-6 text-white mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} />
              <h2 className="font-display font-bold text-xl">即将到来的聚餐</h2>
            </div>
            <p className="text-white/80">
              您有 {upcomingCount} 个即将到来的预约，记得准时参加哦！
            </p>
          </div>
        )}

        {filteredReservations.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredReservations.map((reservation, index) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center card-shadow">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={36} className="text-gray-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-800 mb-2">
              {activeTab === 'all' ? '还没有预约' : `没有${tabs.find(t => t.key === activeTab)?.label}的预约`}
            </h3>
            <p className="text-gray-500 mb-6">
              点击下方按钮创建您的第一个餐厅预约吧
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              新建预约
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowForm(true)}
            className="w-full btn-primary text-lg py-5 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            新建预约
          </button>
        </div>
      </div>
    </div>
  );
}
