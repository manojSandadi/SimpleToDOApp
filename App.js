import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Switch,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    loadTasks();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const runAddAnimation = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks([...tasks, newTask]);
      setTask('');
      runAddAnimation();
    }
  };

  const deleteTask = (taskId) => {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);
    if (taskIndex !== -1) {
      const taskToDelete = tasks[taskIndex];
      const deleteAnim = new Animated.Value(1);
      Animated.timing(deleteAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTasks(tasks.filter((item) => item.id !== taskId));
      });
    }
  };

  const toggleComplete = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const updateTask = (taskId, newText) => {
    setTasks((prevTasks) =>
      prevTasks.map((item) =>
        item.id === taskId ? { ...item, text: newText } : item
      )
    );
    setEditingTaskId(null);
    setEditingText('');
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id); // Set the current task to edit
    setEditingText(task.text); // Set initial text for editing
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addTask()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.taskContainer,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
              item.completed && styles.completedTask,
            ]}
          >
            <Switch
              value={item.completed}
              onValueChange={() => toggleComplete(item.id)}
              trackColor={{ false: '#ddd', true: '#5C5CFF' }}
            />
            {editingTaskId === item.id ? (
              <TextInput
                style={styles.editInput}
                value={editingText}
                onChangeText={(text) => setEditingText(text)} // Update text dynamically
                onSubmitEditing={() => updateTask(item.id, editingText)} // Save on Enter
                onBlur={() => updateTask(item.id, editingText)} // Save on losing focus
              />
            ) : (
              <TouchableOpacity
                style={styles.taskTextContainer}
                onPress={() => startEditingTask(item)}
              >
                <Text
                  style={[
                    styles.taskText,
                    item.completed && styles.completedTaskText,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>X</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  completedTask: {
    backgroundColor: '#e6ffe6',
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: '#5C5CFF',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
