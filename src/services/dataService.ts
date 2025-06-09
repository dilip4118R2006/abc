import { SystemData, User, Component, BorrowRequest, Notification } from '../types';
import { cloudDataService } from './cloudDataService';

class DataService {
  private storageKey = 'isaacLabData';
  private useCloud = true;
  private localData: SystemData | null = null;

  constructor() {
    // Try to load from localStorage as fallback
    this.localData = this.getLocalData();
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

  private getLocalData(): SystemData {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
    return this.getDefaultData();
  }

  private saveLocalData(data: SystemData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.localData = data;
    } catch (error) {
      console.error('Error saving local data:', error);
    }
  }

  // Subscribe to real-time updates
  subscribeToData(callback: (data: SystemData) => void): () => void {
    if (this.useCloud) {
      return cloudDataService.subscribeToUserData((data) => {
        this.saveLocalData(data); // Keep local backup
        callback(data);
      });
    } else {
      // Fallback to local data
      if (this.localData) {
        callback(this.localData);
      }
      return () => {};
    }
  }

  async getData(): Promise<SystemData> {
    if (this.useCloud) {
      try {
        const [components, requests, notifications] = await Promise.all([
          cloudDataService.getComponents(),
          cloudDataService.getRequests(),
          cloudDataService.getNotifications()
        ]);

        const data: SystemData = {
          users: this.localData?.users || this.getDefaultData().users,
          components: components.length > 0 ? components : this.getDefaultData().components,
          requests: requests || [],
          notifications: notifications || []
        };

        this.saveLocalData(data);
        return data;
      } catch (error) {
        console.error('Error loading cloud data, falling back to local:', error);
        return this.localData || this.getDefaultData();
      }
    }
    return this.localData || this.getDefaultData();
  }

  // User operations
  async addUser(user: User): Promise<void> {
    if (this.useCloud) {
      await cloudDataService.addUser(user);
    } else {
      const data = this.localData || this.getDefaultData();
      data.users.push(user);
      this.saveLocalData(data);
    }
  }

  async getUser(email: string): Promise<User | undefined> {
    if (this.useCloud) {
      return await cloudDataService.getUser(email);
    } else {
      const data = this.localData || this.getDefaultData();
      return data.users.find(user => user.email === email);
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    if (this.useCloud) {
      const user = await cloudDataService.authenticateUser(email, password);
      if (user && this.localData) {
        // Update local data with user info
        const existingUserIndex = this.localData.users.findIndex(u => u.email === email);
        if (existingUserIndex === -1) {
          this.localData.users.push(user);
          this.saveLocalData(this.localData);
        }
      }
      return user;
    } else {
      // Fallback to local authentication
      const expectedPassword = email === 'admin@issacasimov.in' ? 'ralab' : 'issacasimov';
      
      if (password !== expectedPassword) {
        return null;
      }

      let user = await this.getUser(email);
      
      if (!user && email.endsWith('@issacasimov.in') && email !== 'admin@issacasimov.in') {
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
  }

  // Component operations
  getComponents(): Component[] {
    if (this.localData) {
      return this.localData.components;
    }
    return this.getDefaultData().components;
  }

  async updateComponent(component: Component): Promise<void> {
    if (this.useCloud) {
      await cloudDataService.updateComponent(component);
    } else {
      const data = this.localData || this.getDefaultData();
      const index = data.components.findIndex(c => c.id === component.id);
      if (index !== -1) {
        data.components[index] = component;
        this.saveLocalData(data);
      }
    }
  }

  async addComponent(component: Component): Promise<void> {
    if (this.useCloud) {
      await cloudDataService.addComponent(component);
    } else {
      const data = this.localData || this.getDefaultData();
      data.components.push(component);
      this.saveLocalData(data);
    }
  }

  // Request operations
  async addRequest(request: BorrowRequest): Promise<void> {
    if (this.useCloud) {
      await cloudDataService.addRequest(request);
    } else {
      const data = this.localData || this.getDefaultData();
      data.requests.push(request);
      this.saveLocalData(data);
    }
  }

  async updateRequest(request: BorrowRequest): Promise<void> {
    if (this.useCloud) {
      await cloudDataService.updateRequest(request);
    } else {
      const data = this.localData || this.getDefaultData();
      const index = data.requests.findIndex(r => r.id === request.id);
      if (index !== -1) {
        data.requests[index] = request;
        this.saveLocalData(data);
      }
    }
  }

  getRequests(): BorrowRequest[] {
    if (this.localData) {
      return this.localData.requests;
    }
    return [];
  }

  async getUserRequests(userId: string): Promise<BorrowRequest[]> {
    if (this.useCloud) {
      return await cloudDataService.getUserRequests(userId);
    } else {
      const data = this.localData || this.getDefaultData();
      return data.requests.filter(r => r.studentId === userId);
    }
  }

  // Notification operations
  async addNotification(notification: Notification): Promise<void> {
    if (this.useCloud) {
      await cloudDataService.addNotification(notification);
    } else {
      const data = this.localData || this.getDefaultData();
      data.notifications.push(notification);
      this.saveLocalData(data);
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    if (this.useCloud) {
      return await cloudDataService.getUserNotifications(userId);
    } else {
      const data = this.localData || this.getDefaultData();
      return data.notifications.filter(n => n.userId === userId);
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (this.useCloud) {
      await cloudDataService.markNotificationAsRead(notificationId);
    } else {
      const data = this.localData || this.getDefaultData();
      const notification = data.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.saveLocalData(data);
      }
    }
  }

  // Export functionality
  async exportToCSV(): Promise<string> {
    if (this.useCloud) {
      return await cloudDataService.exportToCSV();
    } else {
      const data = this.localData || this.getDefaultData();
      const requests = data.requests;
      
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
  }

  // Cleanup
  cleanup(): void {
    if (this.useCloud) {
      cloudDataService.unsubscribeAll();
    }
  }
}

export const dataService = new DataService();