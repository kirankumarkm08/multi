import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

interface EventCardProps {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  attendees: number;
  category: string;
  imageUrl: string;
  featured?: boolean;
}

export default function EventCard({
  title,
  description,
  eventDate,
  location,
  attendees,
  category,
  imageUrl,
  featured = false
}: EventCardProps) {
  return (
    <div className="group relative w-full overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300" style={{ maxWidth: '600px' }}>
      {featured && (
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          FEATURED
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative overflow-hidden" style={{ height: '400px' }}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-white/20 backdrop-blur-md rounded-full border border-white/30" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {category}
          </span>
        </div>
      </div>

      <div className="relative p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
              <Calendar className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{eventDate}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
              <MapPin className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{location}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{attendees.toLocaleString()} attending</span>
          </div>
        </div>

        <div className="pt-4">
          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transform hover:translate-y-[-2px] transition-all duration-200 shadow-md hover:shadow-lg group/btn" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.01em' }}>
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
