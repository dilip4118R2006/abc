import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SystemData, User, Component, BorrowRequest, Notification } from '../types';

class CloudDataService {
  private userEmail: string | null = null;
  private listeners: (() => void)[] = [];

  setUserEmail(email: string) {
    this.userEmail = email;
  }

  private getUserDocId(): string {
    if (!this.userEmail) throw new Error('User email not set');
    return this.userEmail.replace(/[.#$[\]]/g, '_');
  }

  // Real-time listeners
  subscribeToUserData(callback: (data: SystemData) => void): () => void {
    if (!this.userEmail) return () => {};

    const userDocId = this.getUserDocId();
    
    // Listen to user document
    const unsubscribeUser = onSnapshot(
      doc(db, 'users', userDocId),
      async (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Get all related data
          const [components, requests, notifications] = await Promise.all([
            this.getComponents(),
            this.getRequests(),
            this.getNotifications()
          ]);

          const systemData: SystemData = {
            users: userData.users || [],
            components: components || [],
            requests: requests || [],
            notifications: notifications || []
          };

          callback(systemData);
        } else {
          // Initialize with default data if user document doesn't exist
          const defaultData = this.getDefaultData();
          await this.initializeUserData(defaultData);
          callback(defaultData);
        }
      }
    );

    this.listeners.push(unsubscribeUser);
    return unsubscribeUser;
  }

  private getDefaultData(): SystemData {
    return {
      users: [
        {
          id: 'admin-1',
          name: 'Administrator',
          email: 'admin@issacasimov.in',
          role: 'admin',
          registeredAt: new Date().toISOString(),
        }
      ],
      components: [
        {
          id: 'comp-1',
          name: 'Arduino Uno R3',
          totalQuantity: 25,
          availableQuantity: 25,
          category: 'Microcontroller',
          description: 'Arduino Uno R3 development board'
        },
        {
          id: 'comp-2',
          name: 'L298N Motor Driver',
          totalQuantity: 15,
          availableQuantity: 15,
          category: 'Motor Driver',
          description: 'Dual H-Bridge Motor Driver'
        },
        {
          id: 'comp-3',
          name: 'Ultrasonic Sensor HC-SR04',
          totalQuantity: 20,
          availableQuantity: 20,
          category: 'Sensor',
          description: 'Ultrasonic distance sensor'
        },
        {
          id: 'comp-4',
          name: 'Servo Motor SG90',
          totalQuantity: 30,
          availableQuantity: 30,
          category: 'Actuator',
          description: '9g micro servo motor'
        },
        {
          id: 'comp-5',
          name: 'ESP32 Development Board',
          totalQuantity: 12,
          availableQuantity: 12,
          category: 'Microcontroller',
          description: 'WiFi and Bluetooth enabled microcontroller'
        },
        {
          id: 'comp-6',
          name: 'Raspberry Pi 4',
          totalQuantity: 12,
          availableQuantity: 12,
          category: 'Single Board Computer',
          description: 'Model B 4Gb RAM Varient'
        },
        {
          id: 'comp-7',
          name: 'Breadboard 830 Points',
          totalQuantity: 12,
          availableQuantity: 12,
          category: 'Prototyping',
          description: 'Solderless breadboard for prototyping'
        },
        {
          id: 'comp-8',
          name: 'PIR Motion Sensor',
          totalQuantity: 12,
          availableQuantity: 12,
          category: 'Sensor',
          description: 'Passive infrared motion sensor'
        }
      ],
      requests: [],
      notifications: []
    };
  }

  async initializeUserData(data: SystemData): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const batch = writeBatch(db);

    // Set user document
    const userRef = doc(db, 'users', userDocId);
    batch.set(userRef, {
      email: this.userEmail,
      users: data.users,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add components
    for (const component of data.components) {
      const componentRef = doc(db, 'users', userDocId, 'components', component.id);
      batch.set(componentRef, {
        ...component,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  }

  // Component operations
  async getComponents(): Promise<Component[]> {
    if (!this.userEmail) return [];

    const userDocId = this.getUserDocId();
    const componentsRef = collection(db, 'users', userDocId, 'components');
    const snapshot = await getDocs(componentsRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        totalQuantity: data.totalQuantity,
        availableQuantity: data.availableQuantity,
        category: data.category,
        description: data.description
      };
    });
  }

  async addComponent(component: Component): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const componentRef = doc(db, 'users', userDocId, 'components', component.id);
    
    await setDoc(componentRef, {
      ...component,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async updateComponent(component: Component): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const componentRef = doc(db, 'users', userDocId, 'components', component.id);
    
    await updateDoc(componentRef, {
      ...component,
      updatedAt: serverTimestamp()
    });
  }

  // Request operations
  async getRequests(): Promise<BorrowRequest[]> {
    if (!this.userEmail) return [];

    const userDocId = this.getUserDocId();
    const requestsRef = collection(db, 'users', userDocId, 'requests');
    const q = query(requestsRef, orderBy('requestDate', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        studentId: data.studentId,
        studentName: data.studentName,
        rollNo: data.rollNo,
        mobile: data.mobile,
        componentId: data.componentId,
        componentName: data.componentName,
        quantity: data.quantity,
        requestDate: data.requestDate,
        dueDate: data.dueDate,
        status: data.status,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        returnedAt: data.returnedAt,
        notes: data.notes
      };
    });
  }

  async addRequest(request: BorrowRequest): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const requestRef = doc(db, 'users', userDocId, 'requests', request.id);
    
    await setDoc(requestRef, {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async updateRequest(request: BorrowRequest): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const requestRef = doc(db, 'users', userDocId, 'requests', request.id);
    
    await updateDoc(requestRef, {
      ...request,
      updatedAt: serverTimestamp()
    });
  }

  async getUserRequests(userId: string): Promise<BorrowRequest[]> {
    if (!this.userEmail) return [];

    const userDocId = this.getUserDocId();
    const requestsRef = collection(db, 'users', userDocId, 'requests');
    const q = query(requestsRef, where('studentId', '==', userId), orderBy('requestDate', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        studentId: data.studentId,
        studentName: data.studentName,
        rollNo: data.rollNo,
        mobile: data.mobile,
        componentId: data.componentId,
        componentName: data.componentName,
        quantity: data.quantity,
        requestDate: data.requestDate,
        dueDate: data.dueDate,
        status: data.status,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        returnedAt: data.returnedAt,
        notes: data.notes
      };
    });
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    if (!this.userEmail) return [];

    const userDocId = this.getUserDocId();
    const notificationsRef = collection(db, 'users', userDocId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        read: data.read,
        createdAt: data.createdAt
      };
    });
  }

  async addNotification(notification: Notification): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const notificationRef = doc(db, 'users', userDocId, 'notifications', notification.id);
    
    await setDoc(notificationRef, {
      ...notification,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    if (!this.userEmail) return [];

    const userDocId = this.getUserDocId();
    const notificationsRef = collection(db, 'users', userDocId, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        read: data.read,
        createdAt: data.createdAt
      };
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const notificationRef = doc(db, 'users', userDocId, 'notifications', notificationId);
    
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: serverTimestamp()
    });
  }

  // User operations
  async addUser(user: User): Promise<void> {
    if (!this.userEmail) return;

    const userDocId = this.getUserDocId();
    const userRef = doc(db, 'users', userDocId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const users = userData.users || [];
      users.push(user);
      
      await updateDoc(userRef, {
        users: users,
        updatedAt: serverTimestamp()
      });
    }
  }

  async getUser(email: string): Promise<User | undefined> {
    if (!this.userEmail) return undefined;

    const userDocId = this.getUserDocId();
    const userRef = doc(db, 'users', userDocId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const users = userData.users || [];
      return users.find((user: User) => user.email === email);
    }
    
    return undefined;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const expectedPassword = email === 'admin@issacasimov.in' ? 'ralab' : 'issacasimov';
    
    if (password !== expectedPassword) {
      return null;
    }

    // Set user email for cloud operations
    this.setUserEmail(email);

    let user = await this.getUser(email);
    
    if (!user && email.endsWith('@issacasimov.in') && email !== 'admin@issacasimov.in') {
      // Create new student user
      const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      user = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'student',
        registeredAt: new Date().toISOString(),
      };
      await this.addUser(user);
    }

    return user || null;
  }

  // Export functionality
  async exportToCSV(): Promise<string> {
    const requests = await this.getRequests();
    
    const headers = [
      'Request Date',
      'Student Name',
      'Roll Number',
      'Mobile',
      'Component',
      'Quantity',
      'Due Date',
      'Status',
      'Approved By',
      'Approved Date',
      'Returned Date'
    ];

    const rows = requests.map(request => [
      new Date(request.requestDate).toLocaleDateString(),
      request.studentName,
      request.rollNo,
      request.mobile,
      request.componentName,
      request.quantity.toString(),
      new Date(request.dueDate).toLocaleDateString(),
      request.status.charAt(0).toUpperCase() + request.status.slice(1),
      request.approvedBy || '',
      request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : '',
      request.returnedAt ? new Date(request.returnedAt).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Cleanup
  unsubscribeAll(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

export const cloudDataService = new CloudDataService();