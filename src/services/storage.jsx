import AsyncStorage from '@react-native-async-storage/async-storage';
//import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns/esm';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns void
 * @param { {} } reminder
 * 
 */
export async function setReminderStore(reminder) {
  try {

    //Buscar lembretes do async storage

    //cocolar o intervalo para a próxima notificação
    const nextTime = new Date(reminder.selectedDateTime);
    console.log(nextTime.getHours())
    console.log(nextTime.getMinutes())
    const now = new Date();

    const seconds = Math.abs(
      Math.ceil((now.getTime() - nextTime.getTime()) / 1000)
    )

    //Criar a notificação
    const notifificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.contentTitle,
        body: reminder.content,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          reminder
        },
      },
      trigger: {
        hour: Number(nextTime.getHours()),
        minute: Number(nextTime.getMinutes()),
        repeats: true
      }
    });

    //Colocar no Armazenamento
    const data = await AsyncStorage.getItem('@SmartReminder:Reminders');
    const oldReminders = data ? (JSON.parse(data)) : {};
    const id = uuidv4();
    const newReminder = {
      [id]: {
        data: { ...reminder, id },
        hour: reminder.selectedDateTime,
        id,
        notifificationId
      }
    }
    await AsyncStorage.setItem('@SmartReminder:Reminders',
      JSON.stringify({
        ...newReminder,
        ...oldReminders
      })
    )

    // const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

    // TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
    //   console.log('Received a notification in the background!');
    //   // Do something with the notification data
    // });

    // Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

  } catch (e) {
    throw new Error(e);
  }
}


export async function loadRemindersStorage() {
  try {
    const data = await AsyncStorage.getItem('@SmartReminder:Reminders');
    const stickeNotes = data ? (JSON.parse(data)) : {};
    const stickNotesShorted = Object
      .keys(stickeNotes)
      .map((stickeNote) => {
        return {
          ...stickeNotes[stickeNote].data,
          hour: format(new Date(stickeNotes[stickeNote].data.selectedDateTime), 'HH:mm')
        }
      })
    return stickNotesShorted;
  } catch (error) {
    throw new Error(error);
  }
}

export async function removeReminderStorage(id) {

  try {
    const data = await AsyncStorage.getItem('@SmartReminder:Reminders');
    const stickeNotes = data ? (JSON.parse(data)) : {};

    //Cancelar a notificação
    await Notifications.cancelScheduledNotificationAsync(stickeNotes[id].notifificationId);

    //Deletar do armazenamento local
    delete stickeNotes[id];
    await AsyncStorage.setItem(
      '@SmartReminder:Reminders',
      JSON.stringify(stickeNotes)
    )

  } catch (error) {
    throw new Error(error);
  }

}
