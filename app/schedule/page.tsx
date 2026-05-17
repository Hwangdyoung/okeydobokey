'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import styles from '@/styles/Schedule.module.css';

// 하이드레이션 이슈 방지를 위해 Calendar를 클라이언트 전용으로 동적 임포트 (ssr: false)
const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

// 대규모 힙합/R&B 공연 일정 데이터 (티켓 링크 포함)
const scheduleData = [
  // [과거/완료된 공연]
  { id: 1, title: 'RAP HOUSE VOL.50', date: '2026-03-27', location: '플렉스라운지', ticketLink: "" },
  { id: 2, title: 'RAP HOUSE VOL.51', date: '2026-04-17', location: '플렉스라운지', ticketLink: "" },
  { id: 3, title: 'HIPHOPPLAYA FESTIVAL 2026', date: '2026-05-02', location: '킨텍스', lineup: '이센스, 지코, 박재범, 크러쉬 등', ticketLink: "" },
  { id: 4, title: 'CHANGMO : THE EMPEROR', startDate: '2026-05-08', endDate: '2026-05-10', location: '세종문화회관 대극장', ticketLink: "" },
  { id: 5, title: 'D-Hack 콘서트 [디핵과 별빛연맹]', date: '2026-05-09', location: 'KT&G 상상마당', ticketLink: "" },
  { id: 6, title: 'RAP HOUSE VOL.52', date: '2026-05-15', location: '플렉스라운지', ticketLink: "" },
  
  // [예정된 공연]
  { id: 7, title: 'RAPBEAT 2026', startDate: '2026-06-20', endDate: '2026-06-21', location: '마포 문화비축기지', lineup: '지코, 박재범, 씨잼 등', ticketLink: "https://ticket.melon.com" },
  { id: 8, title: 'WATERBOMB SEOUL 2026', startDate: '2026-07-24', endDate: '2026-07-26', location: '서울', ticketLink: "https://tickets.interpark.com" },
  { id: 9, title: '빈지노 단독 콘서트 \'NOWITZKI\' 앙코르', date: '2026-08-15', location: '올림픽공원 올림픽홀', ticketLink: "https://ticket.melon.com" },
  { id: 10, title: '이센스(E SENS) 전국 투어', date: '2026-09-12', location: 'KBS 아레나', ticketLink: "https://yes24.com" },
  { id: 11, title: 'Post Malone 투어', date: '2026-10-02', location: '고양', ticketLink: "https://tickets.interpark.com" },
  { id: 12, title: 'The Weeknd 내한공연', startDate: '2026-10-07', endDate: '2026-10-08', location: '고양종합운동장', ticketLink: "https://tickets.interpark.com" },
  { id: 13, title: '키드밀리(Kid Milli) & 양홍원 조인트 콘서트', date: '2026-11-20', location: '블루스퀘어', ticketLink: "https://ticket.melon.com" },
];

export default function SchedulePage() {
  const [value, setValue] = useState<Date | null>(null);
  const [activeDate, setActiveDate] = useState<Date>(new Date('2026-05-17')); // 현재 날짜 기준

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
    return scheduleData.filter(event => {
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
    return scheduleData.filter(event => isDateInEvent(dateStr, event));
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
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>{activeDate.getFullYear()} SCHEDULE</h1>
        
        <div className={styles.contentWrapper}>
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

          <div className={styles.listWrapper}>
            <h2 className={styles.listHeader}>{displayTitle}</h2>
            <div className={styles.scrollArea}>
              {sortedEvents.length > 0 ? (
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
                          {!status.isPast && event.ticketLink && (
                            <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" className={styles.ticketBtn}>
                              티켓 구매
                            </a>
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
