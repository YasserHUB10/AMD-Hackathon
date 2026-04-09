import React, { useState } from 'react';
import { Calendar, Clock, Edit, X } from 'lucide-react';

export default function ScheduledList({ scheduledMessages, onDelete, onEdit }) {
  if (scheduledMessages.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">No Scheduled Messages</h3>
        <p className="text-gray-500 dark:text-gray-500">Click "Schedule Message" to create your first scheduled message</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scheduledMessages.map((msg) => (
        <ScheduledItem key={msg.id} msg={msg} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
}

function ScheduledItem({ msg, onDelete, onEdit }) {
  const [exiting, setExiting] = useState(false);

  const handleDelete = () => {
    setExiting(true);
    setTimeout(() => onDelete(msg.id), 300);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300
        ${exiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{msg.recipient}</h3>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-bold">
              {msg.repeat?.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3 pl-8">{msg.message}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pl-8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {msg.scheduledDate?.toLocaleString()}
            </div>
            <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
              {msg.status}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(msg)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            aria-label={`Edit scheduled message to ${msg.recipient}`}
          >
            <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
            aria-label={`Delete scheduled message to ${msg.recipient}`}
          >
            <X className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
