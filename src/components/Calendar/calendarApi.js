import api from '../../services/api';

export function calendarMonthQueryKey(year, month) {
  return ['calendar-month', year, month];
}

export async function fetchCalendarMonth(year, month) {
  const response = await api.get('/api/calendar/month', { params: { year, month } });
  return response.data;
}
