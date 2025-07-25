import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

import { CRAFT_CATEGORIES, MOCK_CRAFTS, CraftItem } from '@/src/constants/crafts';
import { useCart } from '@/src/context/CartContext';

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

export default function CraftsSection() {
  const [category, setCategory] = useState<string>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [selectedCraft, setSelectedCraft] = useState<CraftItem | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm interested in this craft. Can you tell me more?",
      sent: true,
      time: '10:30',
    },
    {
      id: 2,
      text: 'Hello! Thanks for your interest. What would you like to know?',
      sent: false,
      time: '10:35',
    },
  ]);
  const { addItem, isItemInCart, getItemQuantity } = useCart();

  const filteredCrafts =
    category === 'All' ? MOCK_CRAFTS : MOCK_CRAFTS.filter(item => item.category === category);

  // Show only first 3 items when not expanded, all items when expanded
  const displayedCrafts = showAll ? filteredCrafts : filteredCrafts.slice(0, 3);

  const handleAddToCart = (item: CraftItem) => {
    addItem(item);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: chatMessages.length + 1,
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString().slice(0, 5),
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
    }
  };

  const handleChatOpen = (item: CraftItem) => {
    setSelectedCraft(item);
    setChatVisible(true);
  };

  const renderCraftItem = ({ item }: { item: CraftItem }) => (
    <TouchableOpacity
      style={[styles.card, showAll && styles.cardGrid]}
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.cardImageWrapper}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <View style={styles.categoryRow}>
        <Text style={styles.cardSub}>{item.category}</Text>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{item.details}</Text>
        </View>
      </View>
      <View style={styles.ratingRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <FontAwesome
            key={i}
            name={i < Math.round(item.rating) ? 'star' : 'star-o'}
            size={16}
            color="#FFD600"
            style={{ marginRight: 1 }}
          />
        ))}
        <Text style={styles.ratingCount}>
          {item.rating.toFixed(1)} ({item.ratingCount})
        </Text>
      </View>
      <Text style={styles.cardInfo}>
        Stock: {item.stock} | <Text style={{ fontWeight: 'bold' }}>{item.price}</Text>
      </Text>
      <Text style={styles.cardSeller}>Seller: {item.seller}</Text>
      <View style={styles.cardFooterRow}>
        <TouchableOpacity
          style={[styles.addBtn, isItemInCart(item.id) && styles.addBtnInCart]}
          onPress={e => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
        >
          <FontAwesome name="shopping-cart" size={16} color="#fff" />
          <Text style={styles.addBtnText}>
            {isItemInCart(item.id) ? `Added (${getItemQuantity(item.id)})` : 'Add'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={e => {
            e.stopPropagation();
            handleChatOpen(item);
          }}
        >
          <FontAwesome name="comment" size={16} color="#386B5F" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderTitle}>Crafts</Text>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.categoryButtonText}>{category}</Text>
          <FontAwesome name="chevron-down" size={16} color="#386B5F" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <Pressable style={styles.seeAllBtn} onPress={() => setShowAll(!showAll)}>
          <Text style={styles.seeAllText}>{showAll ? 'Show Less' : 'See All'}</Text>
        </Pressable>
      </View>

      {showAll ? (
        // Grid layout when showing all items
        <FlatList
          data={displayedCrafts}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={renderCraftItem}
        />
      ) : (
        // Horizontal scroll when showing limited items
        <FlatList
          data={displayedCrafts}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={renderCraftItem}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {CRAFT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={styles.modalItem}
                onPress={() => {
                  setCategory(cat);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    cat === category && { fontWeight: 'bold', color: '#386B5F' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.chatBackBtn}>
              <FontAwesome name="arrow-left" size={20} color="#386B5F" />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>{selectedCraft?.seller || 'Seller'}</Text>
              <Text style={styles.chatHeaderSubtitle}>Product: {selectedCraft?.name}</Text>
            </View>
          </View>

          <ScrollView style={styles.messagesList}>
            {chatMessages.map((message: Message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sent ? styles.sentMessage : styles.receivedMessage,
                ]}
              >
                <Text style={[styles.messageText, !message.sent && styles.receivedMessageText]}>
                  {message.text}
                </Text>
                <Text style={[styles.messageTime, !message.sent && styles.receivedMessageTime]}>
                  {message.time}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <FontAwesome name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 12,
  },
  categoryButtonText: {
    color: '#386B5F',
    fontWeight: '700',
    fontSize: 16,
  },
  seeAllBtn: {
    padding: 4,
  },
  seeAllText: {
    color: '#386B5F',
    fontWeight: '600',
    fontSize: 15,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 14,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E6F3EC',
  },
  cardGrid: {
    width: '48%',
    marginRight: 0,
    marginBottom: 12,
  },
  cardImageWrapper: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    height: 100,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: '#386B5F',
    marginBottom: 2,
    marginRight: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  labelBadge: {
    backgroundColor: '#E6F3EC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 2,
  },
  labelText: {
    fontSize: 12,
    color: '#386B5F',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingCount: {
    fontSize: 13,
    color: '#222',
    marginLeft: 4,
    fontWeight: '600',
  },
  cardInfo: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  cardSeller: {
    fontSize: 13,
    color: '#386B5F',
    marginBottom: 2,
  },
  cardDetails: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#386B5F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnInCart: {
    backgroundColor: '#2D5A4F',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'flex-start',
  },
  modalItem: {
    paddingVertical: 10,
    width: '100%',
  },
  modalItemText: {
    fontSize: 18,
    color: '#386B5F',
  },
  chatBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 8,
    marginLeft: 8,
  },
  // Chat Modal Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    backgroundColor: '#fff',
  },
  chatBackBtn: {
    marginRight: 16,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#386B5F',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F6F8',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  receivedMessageText: {
    color: '#222',
  },
  receivedMessageTime: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#386B5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
