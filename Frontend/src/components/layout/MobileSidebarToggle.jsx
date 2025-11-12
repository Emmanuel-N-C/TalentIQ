import { Menu, X } from 'lucide-react';

export default function MobileSidebarToggle({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <Menu className="w-6 h-6 text-white" />
      )}
    </button>
  );
}