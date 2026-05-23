'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import styles from '@/styles/Schedule.module.css';

// 하이드레이션 이슈 방지를 위해 Calendar를 클라이언트 전용으로 동적 임포트 (ssr: false)
const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

export default function SchedulePage() {
  const [value, setValue] = useState<Date | null>(null);
  const [activeDate, setActiveDate] = useState<Date>(new Date('2026-05-17')); // 현재 날짜 기준
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 실시간 크롤러 API 연동 데이터 패칭
  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/schedule');
        if (res.ok) {
          const data = await res.json();
          setScheduleEvents(data);
        }
      } catch (err) {
        console.error('공연 스케줄 연동 오류:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSchedule();
  }, []);

  // 배지 및 상태 계산 로직
  const getBadge = (event: any) => {
    const today = new Date('2026-05-17'); // 기준 날짜 고정
    const targetDate = new Date(event.endDate || event.date);
    const startDate = new Date(event.startDate || event.date);

    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (today > targetDate) {
      return { text: '공연종료', type: 'ended', isPast: true };
    } else if (diffDays === 0) {
      return { text: 'D-DAY', type: 'dday', isPast: false };
    } else if (diffDays > 0) {
      return { text: `D-${diffDays}`, type: 'upcoming', isPast: false };
    } else {
      return { text: '진행중', type: 'ongoing', isPast: false };
    }
  };

  const isDateInEvent = (dateStr: string, event: any) => {
    if (event.date === dateStr) return true;
    if (event.startDate && event.endDate) {
      return dateStr >= event.startDate && dateStr <= event.endDate;
    }
    return false;
  };

  const getEventsForMonth = (year: number, monthIndex: number) => {
    const monthStart = new Date(year, monthIndex, 1).toISOString().split('T')[0];
    const monthEnd = new Date(year, monthIndex + 1, 0).toISOString().split('T')[0];
    return scheduleEvents.filter(event => {
      const eventStart = event.startDate || event.date;
      const eventEnd = event.endDate || event.date;

      // 방어막: 시작일이나 종료일이 없으면 필터링에서 제외 (false 반환)
      if (!eventStart || !eventEnd) return false;

      return eventStart <= monthEnd && eventEnd >= monthStart;
    });
  };

  const getEventsForDate = (date: Date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const dateStr = localDate.toISOString().split('T')[0];
    return scheduleEvents.filter(event => isDateInEvent(dateStr, event));
  };

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month' && getEventsForDate(date).length > 0) {
      return <div className={styles.hasEventDot}><div className={styles.dot}></div></div>;
    }
    return null;
  };

  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveDate(activeStartDate);
      setValue(null);
    }
  };

  const selectedEvents = value ? getEventsForDate(value) : getEventsForMonth(activeDate.getFullYear(), activeDate.getMonth());

  const sortedEvents = [...selectedEvents].sort((a, b) => {
    const badgeA = getBadge(a);
    const badgeB = getBadge(b);
    if (badgeA.isPast && !badgeB.isPast) return 1;
    if (!badgeA.isPast && badgeB.isPast) return -1;

    const timeA = new Date(a.startDate || a.date || '').getTime();
    const timeB = new Date(b.startDate || b.date || '').getTime();
    return timeA - timeB;
  });

  const displayTitle = value ? `${value.getFullYear()}년 ${value.getMonth() + 1}월 ${value.getDate()}일 일정` : `${activeDate.getFullYear()}년 ${activeDate.getMonth() + 1}월 주요 일정`;

  return (
    <main className={`${styles.main} gridBackground`}>
      <div className={styles.container}>
        <h1 className={styles.title}>{activeDate.getFullYear()} SCHEDULE</h1>

        <div className={styles.contentWrapper}>
          {/* 달력 영역 */}
          <div className={styles.calendarWrapper}>
            <Calendar
              locale="ko-KR"
              onChange={(val) => setValue(val as Date)}
              value={value}
              activeStartDate={activeDate}
              onActiveStartDateChange={handleActiveStartDateChange}
              tileContent={tileContent}
              formatDay={(locale, date) => date.getDate().toString()}
            />
          </div>

          {/* 공연 목록 카드 영역 */}
          <div className={styles.listWrapper}>
            <h2 className={styles.listHeader}>{displayTitle}</h2>
            <div className={styles.scrollArea}>
              {isLoading ? (
                <div className={styles.noEvents}>실시간 공연 일정을 불러오는 중입니다...</div>
              ) : sortedEvents.length > 0 ? (
                sortedEvents.map(event => {
                  const status = getBadge(event);
                  return (
                    <div key={event.id} className={`${styles.eventCard} ${status.isPast ? styles.eventEnded : ''}`}>
                      <div className={styles.cardHeader}>
                        <div className={styles.badgeWrapper}>
                          <span className={`${styles.badge} ${styles[status.type]}`}>{status.text}</span>
                        </div>
                      </div>
                      <div className={styles.cardMain}>
                        <div className={styles.eventDate}>{event.startDate && event.endDate ? `${event.startDate} ~ ${event.endDate}` : event.date}</div>
                        <div className={styles.eventName}>{event.title}</div>
                        <div className={styles.flexRow}>
                          <div className={styles.eventLocation}>📍 {event.location}</div>
                          {!status.isPast && event.ticketLinks && event.ticketLinks.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {event.ticketLinks.map((link: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.ticketBtn}
                                  style={{
                                    border: '1px solid var(--clr-accent)',
                                    background: 'transparent',
                                    color: 'var(--clr-accent)',
                                    fontSize: '0.7rem',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--clr-accent)';
                                    e.currentTarget.style.color = 'var(--clr-dark-1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--clr-accent)';
                                  }}
                                >
                                  {link.vendor}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        {event.lineup && <div className={styles.eventLineup}>Lineup: {event.lineup}</div>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.noEvents}>해당 월에 예정된 힙합 공연이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
