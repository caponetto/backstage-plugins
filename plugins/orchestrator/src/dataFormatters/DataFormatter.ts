interface DataFormatter<Data, FormattedData> {
  format(Data): FormattedData;
}

export default DataFormatter;
