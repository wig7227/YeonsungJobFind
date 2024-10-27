/*
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Template {
  id: number;
  title: string;
  contents: string;
  qualificationType: string;
  hourlyWage: string;
  applicationMethod: string;
  created_at: string;
  last_used: string;
}

interface CreateTemplateData {
  title: string;
  contents: string;
  qualificationType: string;
  hourlyWage: string;
  applicationMethod: string;
}

const TemplateManagementScreen = () => {
  const { userId } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateData, setTemplateData] = useState<CreateTemplateData>({
    title: '',
    contents: '',
    qualificationType: '',
    hourlyWage: '',
    applicationMethod: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`http://192.168.219.101:3000/api/templates/${userId}`);
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('템플릿 조회 실패:', error);
      Alert.alert('오류', '템플릿을 불러오는데 실패했습니다.');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await axios.post(`http://192.168.219.101:3000/api/templates`, {
        ...templateData,
        employerId: userId,
      });
      if (response.data.success) {
        Alert.alert('성공', '템플릿이 생성되었습니다.');
        setModalVisible(false);
        resetTemplateData();
        fetchTemplates();
      }
    } catch (error) {
      console.error('템플릿 생성 실패:', error);
      Alert.alert('오류', '템플릿 생성에 실패했습니다.');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await axios.put(`http://192.168.219.101:3000/api/templates/${editingTemplate.id}`, templateData);
      if (response.data.success) {
        Alert.alert('성공', '템플릿이 수정되었습니다.');
        setModalVisible(false);
        setEditingTemplate(null);
        resetTemplateData();
        fetchTemplates();
      }
    } catch (error) {
      console.error('템플릿 수정 실패:', error);
      Alert.alert('오류', '템플릿 수정에 실패했습니다.');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    Alert.alert(
      '템플릿 삭제',
      '이 템플릿을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`http://192.168.219.101:3000/api/templates/${templateId}`);
              if (response.data.success) {
                Alert.alert('성공', '템플릿이 삭제되었습니다.');
                fetchTemplates();
              }
            } catch (error) {
              console.error('템플릿 삭제 실패:', error);
              Alert.alert('오류', '템플릿 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateData({
      title: template.title,
      contents: template.contents,
      qualificationType: template.qualificationType,
      hourlyWage: template.hourlyWage,
      applicationMethod: template.applicationMethod,
    });
    setModalVisible(true);
  };

  const resetTemplateData = () => {
    setTemplateData({
      title: '',
      contents: '',
      qualificationType: '',
      hourlyWage: '',
      applicationMethod: '',
    });
  };

  const handleUseTemplate = (template: Template) => {
    Alert.alert(
      '템플릿 사용',
      '이 템플릿으로 새 공고를 작성하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            // 공고 작성 화면으로 이동하면서 템플릿 데이터 전달
            navigation.navigate('PostJob', { templateData: template });
          }
        }
      ]
    );
  };

  const renderTemplate = ({ item }: { item: Template }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <Text style={styles.templateTitle}>{item.title}</Text>
        <View style={styles.templateActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditTemplate(item)}
          >
            <Ionicons name="create-outline" size={24} color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteTemplate(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.templateContent} numberOfLines={3}>{item.contents}</Text>
      <View style={styles.templateInfo}>
        <Text style={styles.infoText}>자격: {item.qualificationType}</Text>
        <Text style={styles.infoText}>시급: {item.hourlyWage}원</Text>
      </View>
      <TouchableOpacity 
        style={styles.useTemplateButton}
        onPress={() => handleUseTemplate(item)}
      >
        <Text style={styles.useTemplateButtonText}>이 템플릿으로 공고 작성</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>템플릿 관리</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetTemplateData();
            setEditingTemplate(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>저장된 템플릿이 없습니다.</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingTemplate ? '템플릿 수정' : '새 템플릿 만들기'}
              </Text>
              
              <Text style={styles.inputLabel}>제목</Text>
              <TextInput
                style={styles.input}
                value={templateData.title}
                onChangeText={(text) => setTemplateData({...templateData, title: text})}
                placeholder="템플릿 제목"
              />

              <Text style={styles.inputLabel}>내용</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={templateData.contents}
                onChangeText={(text) => setTemplateData({...templateData, contents: text})}
                placeholder="공고 내용"
                multiline
              />

              <Text style={styles.inputLabel}>자격 요건</Text>
              <View style={styles.qualificationButtons}>
                {['근로 장학생', '교비', '조교'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.qualificationButton,
                      templateData.qualificationType === type && styles.selectedQualification
                    ]}
                    onPress={() => setTemplateData({...templateData, qualificationType: type})}
                  >
                    <Text style={[
                      styles.qualificationButtonText,
                      templateData.qualificationType === type && styles.selectedQualificationText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>시급</Text>
              <TextInput
                style={styles.input}
                value={templateData.hourlyWage}
                onChangeText={(text) => setTemplateData({...templateData, hourlyWage: text})}
                placeholder="시급"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>지원 방법</Text>
              <TextInput
                style={styles.input}
                value={templateData.applicationMethod}
                onChangeText={(text) => setTemplateData({...templateData, applicationMethod: text})}
                placeholder="지원 방법"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingTemplate(null);
                    resetTemplateData();
                  }}
                >
                  <Text style={styles.modalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                >
                  <Text style={styles.modalButtonText}>
                    {editingTemplate ? '수정' : '저장'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  templateActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  templateContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  templateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
  },
  useTemplateButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  useTemplateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  qualificationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  qualificationButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedQualification: {
    backgroundColor: '#4a90e2',
  },
  qualificationButtonText: {
    color: '#333',
  },
  selectedQualificationText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  */