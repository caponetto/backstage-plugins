interface DataFormatterInterface<Data, FormattedData> {
  format(Data): FormattedData;
}

export default DataFormatterInterface;
