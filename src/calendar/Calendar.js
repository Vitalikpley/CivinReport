import {FlatList, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useEffect, useState} from 'react';
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
    const { width, height } = useWindowDimensions();
    const { colors } = useTheme();
    const { i18n } = useTranslation();
    const weekDays = i18n.language === 'uk' ? WEEK_DAYS_UK : WEEK_DAYS_EN;
    const isLandscape = width > height;
    const calendarWidth = isLandscape ? width * 0.6 : width;
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
                    map[key] = (map[key] || 0) + 1;
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
        return !!violationsByDate[dateKey];
    };

    return (
        <View style={[
            styles.container,
            isLandscape && styles.containerLandscape,
            { backgroundColor: colors.background }
        ]}>
            <View style={[styles.calendarSection, isLandscape && styles.calendarSectionLandscape, isLandscape && { width: width * 0.6 }]}>
                <Header
                    currentDate={new Date(currentYear, currentMonth, 1)}
                    onNext={handleNextMonth}
                    onPrev={handlePrevMonth}
                    onToday={handleToday}
                    isLandscape={isLandscape}
                />

                <View style={[styles.weekDaysContainer, isLandscape && styles.weekDaysContainerLandscape]}>
                    {weekDays.map((day) => (
                        <View key={day} style={styles.weekDayItem}>
                                <Text style={[styles.weekDayText, isLandscape && styles.weekDayTextLandscape]}>{day}</Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.calendarGrid, isLandscape && styles.calendarGridLandscape]}>
                    <FlatList
                        data={days}
                        numColumns={7}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Day
                                day={item}
                                onPress={() => setSelectedDate(item.date)}
                                isLandscape={isLandscape}
                                hasTodos={hasTodos(item.dateKey)}
                                calendarWidth={calendarWidth}
                            />
                        )}
                        contentContainerStyle={[styles.grid, isLandscape && styles.gridLandscape]}
                        scrollEnabled={false}
                        nestedScrollEnabled={false}
                    />
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    containerLandscape: {
        flexDirection: 'row',
        paddingTop: 20,
    },
    calendarSection: {
        flex: 1,
    },
    calendarSectionLandscape: {
        flexShrink: 0,
        maxHeight: '100%',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    weekDaysContainerLandscape: {
        paddingVertical: 8,
    },
    weekDayItem: {
        width: '14.28%',
        alignItems: 'center',
    },
    weekDayText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
    },
    weekDayTextLandscape: {
        fontSize: 11,
    },
    calendarGrid: {
        flex: 1,
    },
    calendarGridLandscape: {
        flexShrink: 1,
        maxHeight: '100%',
    },
    grid: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    gridLandscape: {
        paddingTop: 5,
        paddingBottom: 5,
    }
});