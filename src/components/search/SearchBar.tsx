/**
 * Search Bar Component
 * Main search input with suggestions and filters
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
  Animated,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSearch } from '../../hooks/useSearch';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterPress?: () => void;
  showFilters?: boolean;
  autoFocus?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'suggestion' | 'category';
  category?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  onFilterPress,
  showFilters = true,
  autoFocus = false,
  value,
  onChangeText,
}) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const { getSearchSuggestions, addToRecentSearches } = useSearch();

  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.length > 0) {
        try {
          const results = await getSearchSuggestions(searchQuery);
          setSuggestions(results);
          setShowSuggestions(true);
          animateSuggestions(true);
        } catch (error) {
          console.error('Failed to load suggestions:', error);
        }
      } else if (isFocused) {
        // Show recent searches when focused but no query
        try {
          const recent = await getSearchSuggestions('', { type: 'recent' });
          setSuggestions(recent);
          setShowSuggestions(true);
          animateSuggestions(true);
        } catch (error) {
          console.error('Failed to load recent searches:', error);
        }
      } else {
        setShowSuggestions(false);
        animateSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isFocused]);

  const animateSuggestions = (show: boolean) => {
    Animated.timing(animatedHeight, {
      toValue: show ? 200 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleTextChange = (text: string) => {
    setSearchQuery(text);
    onChangeText?.(text);
  };

  const handleSearch = (query?: string) => {
    const searchText = query || searchQuery;
    if (searchText.trim()) {
      addToRecentSearches(searchText.trim());
      onSearch?.(searchText.trim());
      setShowSuggestions(false);
      animateSuggestions(false);
      Keyboard.dismiss();
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      animateSuggestions(false);
    }, 150);
  };

  const handleClear = () => {
    setSearchQuery('');
    onChangeText?.('');
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return 'history';
      case 'category':
        return 'folder';
      default:
        return 'search';
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <FontAwesome
        name={getSuggestionIcon(item.type) as any}
        size={16}
        color="#666"
        style={styles.suggestionIcon}
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionText}>{item.text}</Text>
        {item.category && (
          <Text style={styles.suggestionCategory}>in {item.category}</Text>
        )}
      </View>
      {item.type === 'recent' && (
        <TouchableOpacity style={styles.removeButton}>
          <FontAwesome name="times" size={12} color="#999" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <FontAwesome
            name="search"
            size={18}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={handleTextChange}
            onSubmitEditing={() => handleSearch()}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoFocus={autoFocus}
            returnKeyType="search"
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <FontAwesome name="times-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {showFilters && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
          >
            <FontAwesome name="filter" size={18} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <Animated.View
          style={[
            styles.suggestionsContainer,
            { maxHeight: animatedHeight },
          ]}
        >
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionIcon: {
    marginRight: 12,
    width: 16,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
});