using {
  cuid,
  managed
} from '@sap/cds/common';


entity MathResults : cuid, managed {
    inputValue1: Decimal;
    inputValue2: Decimal;
    operation: String;
    resultValue: Decimal;
}


