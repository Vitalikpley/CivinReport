import { FlatList, StyleSheet, Text, View, useWindowDimensions, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Day from './Day';
import Header from './Header';
import { fetchViolations } from '../db/sqlite';

const WEEK_DAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const WEEK_DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getRequiredDays = (year, month) => {
    let days = [];

    const firstDay = new Date(year, month, 1).getDay();
    const daysBefore = firstDay === 0 ? 6 : firstDay - 1;
    const daysInBeforeMonth = new Date(year, month, 0).getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;

    for (let i = daysInBeforeMonth - daysBefore + 1; i <= daysInBeforeMonth; i++) {
        const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
            number: i,
            isCurrentMonth: false,
            isToday: false,
            id: `prev-${i}`,
            dateKey: dateKey,
            date: new Date(prevYear, prevMonth, i)
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const today = new Date();
        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === i;
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        days.push({
            number: i,
            isCurrentMonth: true,
            isToday: isToday,
            id: `curr-${i}`,
            dateKey: dateKey,
            date: new Date(year, month, i)
        });
    }

    const size = days.length;
    for (let i = 1; i <= 42 - size; i++) {
        const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
            number: i,
            isCurrentMonth: false,
            isToday: false,
            id: `next-${i}`,
            dateKey: dateKey,
            date: new Date(nextYear, nextMonth, i)
        });
    }

    return days;
};

export default function Calendar() {
    const today = new Date();
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
    const { i18n } = useTranslation();
    const weekDays = i18n.language === 'uk' ? WEEK_DAYS_UK : WEEK_DAYS_EN;
    const calendarWidth = width;

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [days, setDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [violationsByDate, setViolationsByDate] = useState({});

    useEffect(() => {
        const updatedDays = getRequiredDays(currentYear, currentMonth);
        setDays(updatedDays);
    }, [currentYear, currentMonth]);

    useEffect(() => {
        const loadViolations = async () => {
            try {
                const data = await fetchViolations();
                const map = {};
                data.forEach(v => {
                    if (!v.datetime) return;
                    const key = v.datetime.split('T')[0];
                    if (!map[key]) map[key] = [];
                    map[key].push(v);
                });
                setViolationsByDate(map);
                console.log('[Calendar] Violations by date keys:', Object.keys(map).length);
            } catch (e) {
                console.warn('Load violations for calendar error:', e);
            }
        };
        loadViolations();
    }, []);

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };
    const handleToday = () => {
        const now = new Date();
        setCurrentMonth(now.getMonth());
        setCurrentYear(now.getFullYear());
    };

    const hasTodos = (dateKey) => {
        const arr = violationsByDate[dateKey];
        return Array.isArray(arr) && arr.length > 0;
    };

    const formatDateLabel = (date) => {
        if (!date) return '';
        const locale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
        const formatter = new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        return formatter.format(date);
    };

    const selectedDateKey = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        : null;
    const dayViolations = selectedDateKey && violationsByDate[selectedDateKey]
        ? violationsByDate[selectedDateKey]
        : [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Календар зверху */}
            <View style={styles.calendarSection}>
                <Header
                    currentDate={new Date(currentYear, currentMonth, 1)}
                    onNext={handleNextMonth}
                    onPrev={handlePrevMonth}
                    onToday={handleToday}
                    isLandscape={false}
                />

                <View style={styles.weekDaysContainer}>
                    {weekDays.map((day) => (
                        <View key={day} style={styles.weekDayItem}>
                            <Text
                                style={[
                                    styles.weekDayText,
                                    { color: colors.text }
                                ]}
                            >
                                {day}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.calendarGrid}>
                    <FlatList
                        data={days}
                        numColumns={7}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Day
                                day={item}
                                onPress={() => setSelectedDate(item.date)}
                                isLandscape={false}
                                hasTodos={hasTodos(item.dateKey)}
                                calendarWidth={calendarWidth}
                            />
                        )}
                        contentContainerStyle={styles.grid}
                        scrollEnabled={false}
                        nestedScrollEnabled={false}
                    />
                </View>
            </View>

            {/* Список правопорушень під календарем */}
            <View style={styles.violationsSection}>
                {selectedDate ? (
                    <>
                        <Text style={[styles.violationsTitle, { color: colors.text }]}>
                            {formatDateLabel(selectedDate)}
                        </Text>
                        <ScrollView
                            style={styles.violationsScroll}
                            contentContainerStyle={styles.violationsScrollContent}
                        >
                            {dayViolations.length === 0 ? (
                                <Text style={[styles.violationsEmpty, { color: colors.text }]}>
                                    {i18n.language === 'uk'
                                        ? 'Немає правопорушень на цей день'
                                        : 'No violations on this day'}
                                </Text>
                            ) : (
                                dayViolations.map((v) => (
                                    <View
                                        key={v.id}
                                        style={[
                                            styles.violationItem,
                                            { backgroundColor: colors.card, borderColor: colors.border },
                                        ]}
                                    >
                                        <Text style={[styles.violationCategory, { color: colors.primary }]}>
                                            {v.category}
                                        </Text>
                                        <Text style={[styles.violationDescription, { color: colors.text }]}>
                                            {v.description}
                                        </Text>
                                        <Text style={[styles.violationTime, { color: colors.text }]}>
                                            {new Date(v.datetime).toLocaleTimeString(
                                                i18n.language === 'uk' ? 'uk-UA' : 'en-US',
                                                { hour: '2-digit', minute: '2-digit' }
                                            )}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </>
                ) : (
                    <Text style={[styles.violationsEmpty, { color: colors.text }]}>
                        {i18n.language === 'uk'
                            ? 'Виберіть день, щоб побачити правопорушення'
                            : 'Select a day to see violations'}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendarSection: {
        paddingBottom: 8,
    },
    weekDaysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        paddingVertical: 5,
        borderBottomColor: '#f0f0f0',
    },
    weekDayItem: {
        width: '14.28%',
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 13,
        fontWeight: '600',
    },
    calendarGrid: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    grid: {
        paddingBottom: 4,
    },
    violationsSection: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    violationsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    violationsScroll: {
        flex: 1,
    },
    violationsScrollContent: {
        paddingBottom: 8,
    },
    violationsEmpty: {
        fontSize: 14,
        marginTop: 4,
    },
    violationItem: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
    },
    violationCategory: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    violationDescription: {
        fontSize: 14,
        marginBottom: 4,
    },
    violationTime: {
        fontSize: 12,
        opacity: 0.8,
    },
});