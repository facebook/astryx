import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {HStack} from '@astryxdesign/core/HStack';
import {VStack} from '@astryxdesign/core/VStack';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  cover: {
    width: '100%',
    height: 280,
    objectFit: 'cover',
    borderRadius: 8,
    cursor: 'pointer',
  },
  coverPlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  iconPicker: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 8,
    padding: 16,
  },
  iconButton: {
    fontSize: 24,
    cursor: 'pointer',
    padding: 8,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
  },
  selectedIcon: {
    fontSize: 48,
    cursor: 'pointer',
  },
});

const icons = ['📄', '🎯', '📊', '🚀', '💡', '📝', '🎨', '🔧', '📦', '🌟', '🏠', '📋'];
const covers = [
  'https://picsum.photos/1200/400?random=1',
  'https://picsum.photos/1200/400?random=2',
  'https://picsum.photos/1200/400?random=3',
];

export default function NotionPageHeader() {
  const [selectedIcon, setSelectedIcon] = useState('📄');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <VStack gap={3}>
      {coverImage ? (
        <img
          {...stylex.props(styles.cover)}
          src={coverImage}
          alt="Page cover"
          onClick={() => setCoverImage(covers[Math.floor(Math.random() * covers.length)])}
        />
      ) : (
        <div {...stylex.props(styles.coverPlaceholder)} onClick={() => setCoverImage(covers[0])}>
          <Text color="secondary">Click to add cover</Text>
        </div>
      )}
      <VStack gap={2} padding={4}>
        <HStack gap={2} vAlign="center">
          <span
            {...stylex.props(styles.selectedIcon)}
            onClick={() => setShowIconPicker(!showIconPicker)}
            role="button"
            tabIndex={0}
            aria-label="Change page icon">
            {selectedIcon}
          </span>
          {isEditing ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              style={{fontSize: 32, fontWeight: 700, border: 'none', outline: 'none', width: '100%'}}
            />
          ) : (
            <Heading level={1}>
              <span onClick={() => setIsEditing(true)} role="button" tabIndex={0}>
                {title}
              </span>
            </Heading>
          )}
        </HStack>
        {showIconPicker && (
          <Card padding={2}>
            <div {...stylex.props(styles.iconPicker)}>
              {icons.map(icon => (
                <button
                  key={icon}
                  {...stylex.props(styles.iconButton)}
                  onClick={() => {
                    setSelectedIcon(icon);
                    setShowIconPicker(false);
                  }}
                  aria-label={`Select ${icon} icon`}>
                  {icon}
                </button>
              ))}
            </div>
          </Card>
        )}
        <HStack gap={2}>
          <Button label="Add cover" variant="ghost" size="sm" onClick={() => setCoverImage(covers[0])} />
          <Button label="Change icon" variant="ghost" size="sm" onClick={() => setShowIconPicker(true)} />
        </HStack>
      </VStack>
    </VStack>
  );
}
