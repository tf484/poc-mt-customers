using {MathResults as schemaMathResults} from '../db/schema';

service MathService {

    entity MathResults as projection on schemaMathResults;

    entity MathResultsForUser as select from schemaMathResults where createdBy = $user order by createdAt desc;

    function getUser() returns String;
    
    action add(inputValue1:Decimal,inputValue2:Decimal);

    action subtract(inputValue1:Decimal,inputValue2:Decimal);
}