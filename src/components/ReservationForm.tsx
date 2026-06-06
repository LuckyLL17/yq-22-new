import { useState, useEffect } from 'react';
import { X, Calendar, Users, Phone, User, FileText, ChevronDown, Check, Import, Utensils, Flame, Leaf, Ban, AlertTriangle, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Reservation, ParticipantTaste, SPICY_LABELS } from '@/types';
import { RESTAURANTS } from '@/data/restaurants';

interface ReservationFormProps {
  reservation?: Reservation;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ReservationForm({ reservation, onSubmit, onCancel }: ReservationFormProps) {
  const { people, importParticipantsFromPeople, createReservation, updateReservation } = useStore();
  const isEditing = !!reservation;

  const [restaurantId, setRestaurantId] = useState<string>(reservation?.restaurantId || '');
  const [customRestaurantName, setCustomRestaurantName] = useState(reservation?.restaurantName || '');
  const [restaurantNameInput, setRestaurantNameInput] = useState('');
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [guestCount, setGuestCount] = useState(reservation?.guestCount || 4);
  const [contactName, setContactName] = useState(reservation?.contactName || '');
  const [contactPhone, setContactPhone] = useState(reservation?.contactPhone || '');
  const [note, setNote] = useState(reservation?.note || '');
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(
    reservation?.participantTastes.map(p => p.personId) || []
  );
  const [participantTastes, setParticipantTastes] = useState<ParticipantTaste[]>(
    reservation?.participantTastes || []
  );
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);

  useEffect(() => {
    if (reservation) {
      const date = new Date(reservation.reservationTime);
      setReservationDate(date.toISOString().split('T')[0]);
      setReservationTime(date.toTimeString().slice(0, 5));
    } else {
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 24);
      setReservationDate(defaultDate.toISOString().split('T')[0]);
      setReservationTime('12:00');
    }
  }, [reservation]);

  useEffect(() => {
    if (restaurantId) {
      const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
      if (restaurant) {
        setRestaurantNameInput(restaurant.name);
      }
    } else if (customRestaurantName) {
      setRestaurantNameInput(customRestaurantName);
    }
  }, [restaurantId, customRestaurantName]);

  const filteredRestaurants = RESTAURANTS.filter(r =>
    r.name.toLowerCase().includes(restaurantNameInput.toLowerCase())
  );

  const handleRestaurantSelect = (restaurantId: string) => {
    setRestaurantId(restaurantId);
    setCustomRestaurantName('');
    setShowRestaurantDropdown(false);
  };

  const handleRestaurantInputChange = (value: string) => {
    setRestaurantNameInput(value);
    setRestaurantId('');
    setShowRestaurantDropdown(true);
  };

  const togglePersonSelection = (personId: string) => {
    if (selectedPersonIds.includes(personId)) {
      setSelectedPersonIds(selectedPersonIds.filter(id => id !== personId));
      setParticipantTastes(participantTastes.filter(p => p.personId !== personId));
    } else {
      const newSelected = [...selectedPersonIds, personId];
      setSelectedPersonIds(newSelected);
      const newTastes = importParticipantsFromPeople([personId]);
      setParticipantTastes([...participantTastes, ...newTastes]);
    }
  };

  const importAllSelected = () => {
    const tastes = importParticipantsFromPeople(selectedPersonIds);
    setParticipantTastes(tastes);
    setShowParticipantsPanel(false);
  };

  const handleSubmit = () => {
    if (!restaurantNameInput.trim()) {
      alert('请输入餐厅名称');
      return;
    }
    if (!reservationDate || !reservationTime) {
      alert('请选择预约时间');
      return;
    }
    if (!contactName.trim()) {
      alert('请输入联系人姓名');
      return;
    }
    if (!contactPhone.trim()) {
      alert('请输入联系电话');
      return;
    }

    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`).getTime();
    
    const selectedRestaurant = restaurantId ? RESTAURANTS.find(r => r.id === restaurantId) : null;

    const reservationData = {
      restaurantId: restaurantId || null,
      restaurantName: restaurantNameInput.trim(),
      restaurantImage: selectedRestaurant?.image,
      restaurantAddress: selectedRestaurant?.address,
      reservationTime: reservationDateTime,
      guestCount,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      note: note.trim(),
      participantTastes,
    };

    if (isEditing && reservation) {
      updateReservation(reservation.id, reservationData);
    } else {
      createReservation(reservationData);
    }

    onSubmit();
  };

  const generateTastesNote = () => {
    if (participantTastes.length === 0) return '';
    
    const lines: string[] = [];
    participantTastes.forEach(p => {
      const tastes: string[] = [];
      tastes.push(SPICY_LABELS[p.spicyLevel]);
      if (p.isVegetarian) tastes.push('素食');
      if (p.dislikes.length > 0) tastes.push(`不吃${p.dislikes.join('、')}`);
      if (p.allergies.length > 0) tastes.push(`过敏${p.allergies.join('、')}`);
      if (p.favorites.length > 0) tastes.push(`喜欢${p.favorites.join('、')}`);
      lines.push(`${p.personName}：${tastes.join('，')}`);
    });
    
    return lines.join('\n');
  };

  const fillTastesToNote = () => {
    const tastesNote = generateTastesNote();
    if (tastesNote) {
      setNote(prev => prev ? prev + '\n\n' + tastesNote : tastesNote);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl text-gray-800">
          {isEditing ? '修改预约' : '新建预约'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Utensils size={18} className="text-primary-500" />
            餐厅名称
          </label>
          <div className="relative">
            <input
              type="text"
              value={restaurantNameInput}
              onChange={(e) => handleRestaurantInputChange(e.target.value)}
              onFocus={() => setShowRestaurantDropdown(true)}
              placeholder="选择或输入餐厅名称"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            
            {showRestaurantDropdown && filteredRestaurants.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                {filteredRestaurants.map(restaurant => (
                  <button
                    key={restaurant.id}
                    onClick={() => handleRestaurantSelect(restaurant.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                      restaurantId === restaurant.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-xs text-gray-500">{restaurant.cuisine} · {restaurant.address}</p>
                    </div>
                    {restaurantId === restaurant.id && (
                      <Check size={18} className="text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={18} className="text-orange-500" />
              预约日期
            </label>
            <input
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={18} className="text-orange-500" />
              预约时间
            </label>
            <input
              type="time"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users size={18} className="text-blue-500" />
            用餐人数
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-bold text-gray-800 w-20 text-center">
              {guestCount} 人
            </span>
            <button
              onClick={() => setGuestCount(guestCount + 1)}
              className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={18} className="text-green-500" />
              联系人
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="您的称呼"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone size={18} className="text-green-500" />
              联系电话
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="手机号码"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Import size={18} className="text-purple-500" />
              参加人员口味
            </label>
            <button
              onClick={() => setShowParticipantsPanel(!showParticipantsPanel)}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              {showParticipantsPanel ? '收起' : '选择人员'}
            </button>
          </div>
          
          {participantTastes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {participantTastes.map(p => (
                <span key={p.personId} className="tag bg-purple-50 text-purple-700 flex items-center gap-1">
                  <span>{p.personAvatar}</span>
                  <span>{p.personName}</span>
                </span>
              ))}
            </div>
          )}
          
          {showParticipantsPanel && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-500">
                选择要参加聚餐的人员，他们的口味偏好会自动导入作为预约备注
              </p>
              {people.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">暂无人员，请先添加参与人员</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {people.map(person => (
                    <button
                      key={person.id}
                      onClick={() => togglePersonSelection(person.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedPersonIds.includes(person.id)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{person.avatar}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{person.name}</p>
                        <p className="text-xs text-gray-500">
                          {SPICY_LABELS[person.preferences.spicyLevel]}
                          {person.preferences.isVegetarian && ' · 素食'}
                          {person.preferences.dislikes.length > 0 && ` · ${person.preferences.dislikes.length}项忌口`}
                        </p>
                      </div>
                      {selectedPersonIds.includes(person.id) && (
                        <Check size={18} className="text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={fillTastesToNote}
                  disabled={participantTastes.length === 0}
                  className="flex-1 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  生成口味备注
                </button>
                <button
                  onClick={importAllSelected}
                  disabled={selectedPersonIds.length === 0}
                  className="flex-1 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认导入 {selectedPersonIds.length > 0 && `(${selectedPersonIds.length})`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText size={18} className="text-yellow-500" />
            备注
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="特殊要求、口味偏好、包厢需求等..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {participantTastes.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-4">
            <h4 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
              <Flame size={16} />
              口味概览
            </h4>
            <div className="space-y-3">
              {participantTastes.map(p => (
                <div key={p.personId} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{p.personAvatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{p.personName}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="tag bg-orange-100 text-orange-700 text-xs">
                        {SPICY_LABELS[p.spicyLevel]}
                      </span>
                      {p.isVegetarian && (
                        <span className="tag bg-green-100 text-green-700 text-xs">
                          <Leaf size={10} className="inline mr-1" />
                          素食
                        </span>
                      )}
                      {p.dislikes.length > 0 && (
                        <span className="tag bg-red-100 text-red-700 text-xs">
                          <Ban size={10} className="inline mr-1" />
                          忌{p.dislikes.length}项
                        </span>
                      )}
                      {p.allergies.length > 0 && (
                        <span className="tag bg-purple-100 text-purple-700 text-xs">
                          <AlertTriangle size={10} className="inline mr-1" />
                          过敏{p.allergies.length}项
                        </span>
                      )}
                      {p.favorites.length > 0 && (
                        <span className="tag bg-pink-100 text-pink-700 text-xs">
                          <Heart size={10} className="inline mr-1" />
                          喜{p.favorites.length}项
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            {isEditing ? '保存修改' : '确认预约'}
          </button>
        </div>
      </div>
    </div>
  );
}
