/**
 * Converts an array of objects to a CSV string and triggers a download.
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // 1. Get headers (keys of the first object)
  const headers = Object.keys(data[0]);

  // 2. Build CSV rows
  const csvRows = [
    headers.join(','), // CSV Header row
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName];
        // Handle values that might contain commas or newlines
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  // 3. Create Blob and trigger download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
