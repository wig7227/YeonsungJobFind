/**
 * PostJobScreen.tsx
 * 
 * 이 컴포넌트는 구인자가 새로운 구인 정보를 등록하는 화면입니다.
 * 구인 조건, 업무 내용, 근무 시간 등의 정보를 입력할 수 있습니다.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { validatePostJob } from '../../common/utils/validationUtils';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

// 한글 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

const PostJobScreen: React.FC = () => {
  const { userId } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [qualificationType, setQualificationType] = useState('');
  const [workPeriodStart, setWorkPeriodStart] = useState('');
  const [workPeriodEnd, setWorkPeriodEnd] = useState('');
  const [recruitmentDeadline, setRecruitmentDeadline] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [applicationMethod, setApplicationMethod] = useState('');
  const [contents, setContents] = useState('');  // 새로운 state 추가
  const [contactNumber1, setContactNumber1] = useState('');
  const [contactNumber2, setContactNumber2] = useState('');
  const [contactNumber3, setContactNumber3] = useState('');

  const [showWorkPeriodCalendar, setShowWorkPeriodCalendar] = useState(false);
  const [showRecruitmentDeadlineCalendar, setShowRecruitmentDeadlineCalendar] = useState(false);

  const maxLengths = {
    title: 30,
    contents: 500,
    companyName: 15,
    location: 15,
    hourlyWage: 10,
    applicationMethod: 30,
  };

  const resetForm = () => {
    setTitle('');
    setContents('');
    setCompanyName('');
    setLocation('');
    setQualificationType('');
    setWorkPeriodStart('');
    setWorkPeriodEnd('');
    setRecruitmentDeadline('');
    setHourlyWage('');
    setApplicationMethod('');
    setContactNumber1('');
    setContactNumber2('');
    setContactNumber3('');
    setShowWorkPeriodCalendar(false);
    setShowRecruitmentDeadlineCalendar(false);
  };

  const renderInputWithCounter = (value: string, setValue: (text: string) => void, placeholder: string, maxLength: number, multiline: boolean = false) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={(text) => setValue(text.slice(0, maxLength))}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      <Text style={styles.counter}>{`${value.length}/${maxLength}`}</Text>
    </View>
  );

  const handleSubmit = async () => {
    const fullContactNumber = `${contactNumber1}-${contactNumber2}-${contactNumber3}`;
    const postJobData = {
      employerId: userId,
      title,
      contents,
      companyName,
      location,
      qualificationType,
      workPeriodStart,
      workPeriodEnd,
      recruitmentDeadline,
      hourlyWage,
      applicationMethod,
      contactNumber: fullContactNumber,
    };

    const validationResult = validatePostJob(postJobData);

    if (validationResult.isValid) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/post-job`, postJobData);
        if (response.data.success) {
          Alert.alert('성공', '구인 공고가 성공적으로 등록되었습니다.');
          resetForm();  // 폼 초기화
          // 페이지 상단으로 스크롤
          scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        } else {
          Alert.alert('오류', response.data.message);
        }
      } catch (error) {
        console.error('API 요청 오류:', error);
        Alert.alert('오류', '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.');
      }
    } else {
      Alert.alert('입력 오류', validationResult.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>구인 공고 등록</Text>
        
        <Text style={styles.label}>공고 제목</Text>
        {renderInputWithCounter(title, setTitle, "공고 제목을 입력하세요", maxLengths.title)}

        <Text style={styles.label}>상세 내용</Text>
        {renderInputWithCounter(contents, setContents, "상세 내용을 입력하세요", maxLengths.contents, true)}

        <Text style={styles.label}>회사명</Text>
        {renderInputWithCounter(companyName, setCompanyName, "회사명을 입력하세요", maxLengths.companyName)}

        <Text style={styles.label}>근무 위치</Text>
        {renderInputWithCounter(location, setLocation, "근무 위치를 입력하세요", maxLengths.location)}

        <Text style={styles.label}>지원 자격</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, qualificationType === '근로 장학생' && styles.selectedButton]}
            onPress={() => setQualificationType('근로 장학생')}
          >
            <Text style={styles.buttonText}>근로 장학생</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, qualificationType === '교비' && styles.selectedButton]}
            onPress={() => setQualificationType('교비')}
          >
            <Text style={styles.buttonText}>교비</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, qualificationType === '조교' && styles.selectedButton]}
            onPress={() => setQualificationType('조교')}
          >
            <Text style={styles.buttonText}>조교</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>근무 기간</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowWorkPeriodCalendar(!showWorkPeriodCalendar)}>
          <Text>{workPeriodStart ? `${workPeriodStart} ~ ${workPeriodEnd}` : '근무 기간을 선택하세요'}</Text>
        </TouchableOpacity>
        {showWorkPeriodCalendar && (
          <Calendar
            onDayPress={(day: DateData) => {
              if (!workPeriodStart || (workPeriodStart && workPeriodEnd)) {
                setWorkPeriodStart(day.dateString);
                setWorkPeriodEnd('');
              } else {
                setWorkPeriodEnd(day.dateString);
                setShowWorkPeriodCalendar(false);
              }
            }}
            markedDates={{
              [workPeriodStart]: {startingDay: true, color: '#4a90e2', textColor: 'white'},
              [workPeriodEnd]: {endingDay: true, color: '#4a90e2', textColor: 'white'}
            }}
            markingType={'period'}
          />
        )}

        <Text style={styles.label}>모집 기한</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowRecruitmentDeadlineCalendar(!showRecruitmentDeadlineCalendar)}>
          <Text>{recruitmentDeadline || '모집 기한을 선택하세요'}</Text>
        </TouchableOpacity>
        {showRecruitmentDeadlineCalendar && (
          <Calendar
            onDayPress={(day: DateData) => {
              setRecruitmentDeadline(day.dateString);
              setShowRecruitmentDeadlineCalendar(false);
            }}
            markedDates={{
              [recruitmentDeadline]: {selected: true, selectedColor: '#4a90e2'}
            }}
          />
        )}

        <Text style={styles.label}>시급</Text>
        {renderInputWithCounter(hourlyWage, setHourlyWage, "시급을 입력하세요", maxLengths.hourlyWage)}

        <Text style={styles.label}>지원 방법(이메일)</Text>
        {renderInputWithCounter(applicationMethod, setApplicationMethod, "지원 방법을 입력하세요", maxLengths.applicationMethod)}

        <Text style={styles.label}>문의 (전화번호)</Text>
        <View style={styles.phoneInputContainer}>
          <TextInput
            style={styles.phoneInput}
            value={contactNumber1}
            onChangeText={setContactNumber1}
            placeholder="010"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.phoneSeparator}>-</Text>
          <TextInput
            style={styles.phoneInput}
            value={contactNumber2}
            onChangeText={setContactNumber2}
            placeholder="1234"
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.phoneSeparator}>-</Text>
          <TextInput
            style={styles.phoneInput}
            value={contactNumber3}
            onChangeText={setContactNumber3}
            placeholder="5678"
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>공고 등록</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  counter: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4a90e2',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
  },
  phoneSeparator: {
    paddingHorizontal: 5,
    fontSize: 18,
  },
});

export default PostJobScreen;