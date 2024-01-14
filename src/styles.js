import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // General Styles
  container: {
    flex: 1,
    fontFamily: 'Inter, sans-serif',
    color: '#666666',
    backgroundColor: '#f7fafc',
    fontSize: 16,
    paddingBottom: 80, // Adjust as needed
  },

  // Header Styles
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 40,
  },
  headerGrid: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 320, // Adjust as needed
  },
  headerLogo: {
    height: 40, // Adjust as needed
    marginBottom: 20,
  },
  headerLabel: {
    textTransform: 'uppercase',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },

  // Content Styles
  content: {
    padding: 20,
    width: '100%',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
    maxWidth: 320, // Adjust as needed
    columnGap: 10,
    rowGap: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  flex: {
    display: 'flex',
  },
  flex1: {
    flex: 1,
  },

  // Other Styles (Continue adapting as needed)
  resultContainer: {
    display: 'none',
  },
});

export default styles;
