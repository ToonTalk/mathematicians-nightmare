// ── something worth knowing about every number from 1 to 1,000 ──────────────
// A hand-written note where a number has a story of its own; otherwise the most
// unusual things that can be worked out about it.
const factFor = (() => {
  const NOTED = {
    1: 'Multiply anything by One and nothing happens. It is neither prime nor composite: mathematicians keep it in a class of its own.',
    2: 'The only even prime, which makes it the oddest prime of all.',
    3: 'The first odd prime. Three points always lie in one plane, which is why a three-legged stool never wobbles.',
    4: 'The smallest number that is not prime, apart from One. Any map can be colored with four colors, a fact first proved in 1976, by computer.',
    5: 'There are exactly five regular solids, and the five-pointed star was the secret badge of the Pythagoreans.',
    6: 'The smallest perfect number: its divisors 1, 2 and 3 add up to itself, and multiply to itself as well.',
    7: 'The fewest sides a regular polygon can have and still be impossible to draw with ruler and compass. And 1/7 = 0.142857142857…',
    8: 'Eight and Nine are the only neighbors among all the squares, cubes and higher powers: 2³ and 3². It took until 2002 to prove.',
    9: 'A number can be divided by nine exactly when its digits add up to a multiple of nine.',
    10: 'A triangle of dots, 1 + 2 + 3 + 4, which the Pythagoreans held sacred. We count in tens only because of our fingers.',
    11: 'Its powers spell out Pascal’s triangle: 11, 121, 1331, 14641.',
    12: 'The smallest abundant number: its divisors 1, 2, 3, 4 and 6 add up to 16. Dividing so easily is why we have dozens, twelve hours and twelve inches.',
    13: 'A prime with an unlucky reputation; fear of it is called triskaidekaphobia. It is also a Fibonacci number: 5 + 8.',
    15: 'Every row, column and diagonal of the 3 by 3 magic square adds up to 15.',
    16: 'The only number that is x to the y and also y to the x for two different numbers: 2⁴ = 4².',
    17: 'At eighteen, Gauss found that a regular 17-sided polygon can be drawn with ruler and compass. It decided him on a life in mathematics.',
    18: 'The only number that is exactly twice the sum of its digits.',
    20: 'The faces of an icosahedron. The Maya counted in twenties: fingers and toes.',
    21: 'A Fibonacci number and a triangular number at once (1 + 2 + … + 6), and the total of the spots on a die.',
    22: '22/7 is the schoolroom stand-in for Pi, right to two decimal places. Pi is standing over there if you want the rest.',
    23: 'In a room of only 23 people, it is more likely than not that two share a birthday.',
    24: '4 × 3 × 2 × 1: the ways to line up four things. And 1² + 2² + … + 24² is itself a square, 70², the only such case beyond 1.',
    25: 'The smallest square that is the sum of two squares: 9 + 16, the 3-4-5 right triangle.',
    26: 'The only number squeezed directly between a square (25) and a cube (27), as Fermat proved. Also the letters of the alphabet.',
    27: '3 × 3 × 3. Play “halve it if even, triple it and add 1 if odd” from 27 and it takes 111 steps, climbing to 9,232, before it reaches 1.',
    28: 'The second perfect number: 1 + 2 + 4 + 7 + 14 = 28. It is also 1 + 2 + 3 + … + 7.',
    30: 'The largest number with this property: every smaller number that shares no factor with it is prime.',
    32: '2⁵. Water freezes at 32 degrees Fahrenheit, and a game of chess begins with 32 pieces.',
    33: 'For over sixty years nobody could write 33 as a sum of three cubes. In 2019 Andrew Booker did it, with numbers sixteen digits long.',
    36: 'A square (6²) and a triangular number (1 + 2 + … + 8) at once: the first after 1.',
    37: 'Multiply it by 3, 6, 9, … 27 and you get 111, 222, 333, … 999.',
    40: 'The only number whose English name has its letters in alphabetical order: f-o-r-t-y.',
    41: 'Euler’s lucky prime: n² + n + 41 is prime for every n from 0 to 39.',
    42: 'The answer to life, the universe and everything, according to Douglas Adams. In 2019 it became the last number under 100 to be written as a sum of three cubes.',
    43: 'If chicken nuggets come in boxes of 6, 9 and 20, then 43 is the largest number you cannot buy.',
    45: 'A Kaprekar number: 45² = 2025, and 20 + 25 = 45. Also 1 + 2 + … + 9.',
    46: 'Every human cell carries 46 chromosomes.',
    50: 'The smallest number that is a sum of two squares in two ways: 1 + 49 and 25 + 25.',
    52: 'Cards in a deck and weeks in a year. It is also the number of ways to split five things into groups.',
    55: 'Triangular (1 + 2 + … + 10) and a Fibonacci number: the largest number that is both.',
    60: 'The Babylonians counted in sixties, so an hour has 60 minutes and a minute 60 seconds. It is the smallest number that 1, 2, 3, 4, 5 and 6 all divide.',
    64: 'The squares on a chessboard: a square (8²), a cube (4³) and a sixth power (2⁶) all at once.',
    65: 'The smallest number that is the sum of two different squares in two ways: 1 + 64 and 16 + 49.',
    69: '69² = 4761 and 69³ = 328509: between them, every digit from 0 to 9 exactly once.',
    70: 'The smallest “weird” number: its divisors add up to more than 70, yet no selection of them adds up to exactly 70.',
    72: 'The rule of 72: divide 72 by a rate of interest and you get roughly the years your money takes to double.',
    73: 'The 21st prime. Its mirror image, 37, is the 12th prime, and 21 is 7 × 3.',
    79: 'The atomic number of gold. The alchemists never guessed that what they were after was a number.',
    81: 'The square of the sum of its own digits: (8 + 1)² = 81.',
    88: 'The keys on a piano and the constellations in the sky: 88 of each.',
    89: 'A Fibonacci number, and the decimals of 1/89 begin with the Fibonacci numbers themselves: 0.011235…',
    90: 'The degrees in a right angle.',
    91: 'It looks prime but is 7 × 13. It is also 1 + 2 + … + 13, and 1 + 4 + 9 + 16 + 25 + 36.',
    97: 'The largest two-digit prime. The decimals of 1/97 run for 96 digits before they repeat.',
    100: 'Ten tens: also 1³ + 2³ + 3³ + 4³, and the sum of the first ten odd numbers.',
    105: '3 × 5 × 7, the first three odd primes multiplied together.',
    108: '1¹ × 2² × 3³. Each corner of a regular pentagon measures 108 degrees, and a string of prayer beads in India has 108.',
    111: 'Every row of a 6 by 6 magic square adds up to 111. It is 3 × 37.',
    113: '355/113 gives Pi correct to six decimal places. Zu Chongzhi found it in China fifteen centuries ago.',
    118: 'The number of chemical elements known so far.',
    120: '5 × 4 × 3 × 2 × 1, and also 1 + 2 + … + 15. It is the smallest number with sixteen divisors.',
    121: '11², a palindrome, and 1 + 3 + 9 + 27 + 81.',
    128: '2⁷, and the largest number that cannot be made by adding up different squares.',
    135: '1¹ + 3² + 5³: its own digits, raised to the powers 1, 2 and 3.',
    137: 'Very nearly 1/137 is the number that sets the strength of electricity and magnetism. Sir Arthur Eddington was sure it was exactly 137, which is why this number has a knight for a champion.',
    144: 'A dozen dozens, called a gross, and the largest square anywhere in the Fibonacci sequence.',
    145: '1! + 4! + 5! = 1 + 24 + 120 = 145: the sum of the factorials of its own digits.',
    153: 'The sum of the cubes of its digits, 1 + 125 + 27. Also 1 + 2 + … + 17, and 1! + 2! + 3! + 4! + 5!.',
    163: 'e to the power π√163 misses being a whole number by less than a trillionth. No accident, but it takes deep mathematics to see why.',
    168: 'The hours in a week, and the number of primes below 1,000.',
    169: '13² = 169, and backwards, 31² = 961.',
    180: 'The degrees in a half turn. The three angles of every flat triangle add up to it.',
    196: 'Reverse a number and add; keep going and you nearly always reach a palindrome. 196 never has, in hundreds of millions of digits of trying.',
    204: '1 + 4 + 9 + … + 64: the number of squares of every size on a chessboard.',
    206: 'The bones in a grown human body.',
    210: '2 × 3 × 5 × 7, the first four primes multiplied together. Also 1 + 2 + … + 20.',
    212: 'Water boils at 212 degrees Fahrenheit.',
    216: '6³ = 3³ + 4³ + 5³, the smallest cube that is a sum of three cubes. Many think it is the mysterious “nuptial number” of Plato’s Republic.',
    220: '220 and 284 are friends: the divisors of each add up to the other. The Pythagoreans made the pair a symbol of friendship.',
    239: 'To build 239 out of cubes you need nine of them. Only 23 and 239 are that stubborn.',
    240: 'It has twenty divisors, more than any smaller number.',
    256: '2⁸: the number of values a single byte can hold.',
    257: 'A Fermat prime, 2⁸ + 1, which means a regular 257-sided polygon can be drawn with ruler and compass.',
    273: 'Absolute zero, the coldest anything can be, is about 273 degrees below zero Celsius.',
    276: 'Replace a number by the sum of its smaller divisors, again and again. Nobody knows where 276 ends up; it is the smallest such mystery.',
    284: '284 and 220 are friends: the divisors of each add up to the other. The Pythagoreans made the pair a symbol of friendship.',
    288: '1! × 2! × 3! × 4! = 288. It is also two gross.',
    325: 'The smallest number that is a sum of two squares in three ways: 1 + 324, 36 + 289 and 100 + 225.',
    341: 'The smallest number that fools Fermat’s test for primes: it passes with base 2, yet it is 11 × 31.',
    343: '7 × 7 × 7. Sound travels about 343 meters a second through air.',
    360: 'The degrees in a circle, thanks to the Babylonians. Every number from 1 to 10 divides it, except 7.',
    364: 'All the gifts in “The Twelve Days of Christmas” come to 364: one for every day of the year but one.',
    365: 'The days in a year. Also 10² + 11² + 12², and 13² + 14² as well.',
    366: 'The days in a leap year.',
    404: 'The number the web shows you when a page cannot be found.',
    420: 'The smallest number that 1, 2, 3, 4, 5, 6 and 7 all divide.',
    451: 'The temperature at which book paper catches fire, according to Ray Bradbury’s novel Fahrenheit 451.',
    495: 'Take any three digits, not all the same. Arrange them largest first, subtract the reverse, and repeat: you always arrive at 495.',
    496: 'The third perfect number: its divisors add up to itself. It is also 1 + 2 + 3 + … + 31.',
    512: '2⁹ and 8³, and also (5 + 1 + 2)³: the cube of the sum of its own digits.',
    541: 'The hundredth prime.',
    561: 'The smallest Carmichael number: it slips through Fermat’s test for primes again and again, yet it is 3 × 11 × 17.',
    563: 'One of only three Wilson primes ever found. The others are 5 and 13.',
    567: '567² = 321489: between them, every digit from 1 to 9 exactly once.',
    641: 'Euler discovered that 641 divides 2³² + 1, which sank Fermat’s guess that such numbers are always prime.',
    666: 'The “number of the beast”. It is the sum of the squares of the first seven primes, and of all the numbers on a roulette wheel.',
    679: 'Multiply its digits together, then the digits of the answer, and so on: 378, 168, 48, 32, 6. No smaller number lasts five steps.',
    720: '6 × 5 × 4 × 3 × 2 × 1: the ways to line up six things.',
    729: '9³ and 3⁶. Plato reckoned that a just king lives exactly 729 times more pleasantly than a tyrant.',
    747: 'A palindrome, and a jumbo jet.',
    836: 'A “weird” number: its divisors add up to more than 836, yet no selection of them adds up to exactly 836. Only 70 is smaller and weird.',
    840: 'It has 32 divisors, more than any other number up to 1,000, and it is the smallest that 1 through 8 all divide.',
    871: 'Play “halve it if even, triple it and add 1 if odd” from here and it takes 178 steps to reach 1: longer than any other number below 1,000.',
    873: '1! + 2! + 3! + 4! + 5! + 6! = 873.',
    887: 'After 887 comes the longest stretch without a prime below 1,000: the next one is 907.',
    888: 'In Roman numerals it is DCCCLXXXVIII, longer than any other number up to 1,000.',
    911: 'The emergency telephone number in North America, and a prime.',
    945: 'The smallest odd abundant number: its smaller divisors add up to 975.',
    997: 'The largest three-digit prime.',
    999: '27 × 37, and a Kaprekar number: 999² = 998001, and 998 + 001 = 999.',
    1000: '10 × 10 × 10. The mile is named for it: a thousand paces of a Roman soldier.',
  };
  // Where to read more: the Wikipedia article behind each hand-written note…
  const MORE = {
    1: '1', 2: '2', 3: '3', 4: 'Four color theorem', 5: 'Platonic solid', 6: 'Perfect number', 7: 'Heptagon', 8: 'Catalan\'s conjecture', 9: 'Divisibility rule', 10: 'Tetractys',
    11: 'Pascal\'s triangle', 12: 'Duodecimal', 13: 'Triskaidekaphobia', 15: 'Magic square', 16: '16 (number)', 17: 'Heptadecagon', 18: '18 (number)', 20: 'Vigesimal', 21: '21 (number)',
    22: 'Approximations of pi', 23: 'Birthday problem', 24: 'Cannonball problem', 25: 'Pythagorean triple', 26: '26 (number)', 27: 'Collatz conjecture', 28: 'Perfect number', 30: '30 (number)',
    32: '32 (number)', 33: 'Sums of three cubes', 36: 'Square triangular number', 37: '37 (number)', 40: '40 (number)', 41: 'Lucky numbers of Euler', 42: '42 (number)', 43: 'Coin problem',
    45: 'Kaprekar number', 46: 'Chromosome', 50: '50 (number)', 52: 'Bell number', 55: '55 (number)', 60: 'Sexagesimal', 64: '64 (number)', 65: '65 (number)', 69: '69 (number)',
    70: 'Weird number', 72: 'Rule of 72', 73: '73 (number)', 79: 'Gold', 81: '81 (number)', 88: '88 (number)', 89: '89 (number)', 90: 'Right angle', 91: '91 (number)', 97: '97 (number)',
    100: '100', 105: '105 (number)', 108: '108 (number)', 111: '111 (number)', 113: 'Milü', 118: 'Periodic table', 120: '120 (number)', 121: '121 (number)', 128: '128 (number)',
    135: '135 (number)', 137: 'Fine-structure constant', 144: '144 (number)', 145: 'Factorion', 153: '153 (number)', 163: 'Heegner number', 168: 'Prime-counting function', 169: '169 (number)',
    180: 'Sum of angles of a triangle', 196: 'Lychrel number', 204: '204 (number)', 206: 'List of bones of the human skeleton', 210: 'Primorial', 212: 'Fahrenheit', 216: 'Plato\'s number',
    220: 'Amicable numbers', 239: 'Waring\'s problem', 240: 'Highly composite number', 256: 'Byte', 257: '257-gon', 273: 'Absolute zero', 276: 'Aliquot sequence', 284: 'Amicable numbers',
    288: 'Superfactorial', 325: 'Sum of two squares theorem', 341: 'Pseudoprime', 343: 'Speed of sound', 360: 'Degree (angle)', 364: 'The Twelve Days of Christmas (song)', 365: '365 (number)',
    366: 'Leap year', 404: 'HTTP 404', 420: 'Least common multiple', 451: 'Fahrenheit 451', 495: '495 (number)', 496: '496 (number)', 512: '512 (number)', 541: 'List of prime numbers',
    561: 'Carmichael number', 563: 'Wilson prime', 567: 'Pandigital number', 641: 'Fermat number', 666: '666 (number)', 679: 'Persistence of a number', 720: 'Factorial', 729: 'Plato\'s number',
    747: 'Boeing 747', 836: 'Weird number', 840: '840 (number)', 871: 'Collatz conjecture', 873: 'Factorial', 887: 'Prime gap', 888: 'Roman numerals', 911: '911 (emergency telephone number)',
    945: 'Abundant number', 997: 'List of prime numbers', 999: 'Kaprekar number', 1000: 'Mile',
  };
  // …and the article behind each kind of worked-out fact, recognized by its wording.
  const TOPICS = [
    [/sum of the cubes of its own digits/, 'Narcissistic number'], [/raised to the powers 1, 2 and 3/, 'the full list of such numbers (OEIS)|https://oeis.org/A032799'], [/start from 1 and double it/, 'Power of two'],
    [/Mersenne prime|One less than 2/, 'Mersenne prime'], [/Fibonacci number/, 'Fibonacci sequence'], [/Lucas number/, 'Lucas number'], [/a cube of blocks/, 'Cube (algebra)'],
    [/Add up the first few cubes/, 'Squared triangular number'], [/the square of a square/, 'Fourth power'], [/sum of the first \d+ odd numbers/, 'Square number'], [/times over\.$/, 'Exponentiation'],
    [/triangular number: 1 \+/, 'Triangular number'], [/pyramid number/, 'Square pyramidal number'], [/tetrahedral/, 'Tetrahedral number'], [/hexagon number/, 'Centered hexagonal number'],
    [/pentagonal/, 'Pentagonal number'], [/two neighbors multiplied/, 'Pronic number'], [/Catalan/, 'Catalan number'], [/Bell number/, 'Bell number'], [/more than any smaller number/, 'Highly composite number'],
    [/Its square ends in itself/, 'Automorphic number'], [/Kaprekar/, 'Kaprekar number'], [/one repeated digit/, 'Repdigit'], [/palindromic prime/, 'Palindromic prime'], [/^A palindrome/, 'Palindromic number'],
    [/Its twin/, 'Twin prime'], [/Double it and add 1/, 'Safe and Sophie Germain primes'], [/Read it backwards/, 'Emirp'], [/Fermat found|no two squares can ever/, 'Fermat\'s theorem on sums of two squares'],
    [/as long as they possibly could/, 'Full reptend prime'], [/there is no prime until/, 'Prime gap'], [/guard secrets/, 'RSA cryptosystem'], [/two primes and nothing else|Both are prime/, 'Semiprime'],
    [/three different primes/, 'Sphenic number'], [/As a product of primes/, 'Fundamental theorem of arithmetic'], [/abundant/, 'Abundant number'], [/sum of two squares in/, 'Sum of two squares theorem'],
    [/sum of two cubes/, 'Sum of two cubes'], [/Three squares are never enough/, 'Lagrange\'s four-square theorem'], [/ruler and compass/, 'Constructible polygon'],
    [/difference of two squares|neighboring squares/, 'Difference of two squares'], [/sum of two primes/, 'Goldbach\'s conjecture'], [/halve it if even/, 'Collatz conjecture'], [/happy number/, 'Happy number'],
    [/decimals of 1\//, 'Repeating decimal'], [/In binary it is/, 'Binary number'], [/Roman numerals/, 'Roman numerals'],
  ];
  const topicOf = text => (TOPICS.find(([re]) => re.test(text)) || [])[1];
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', sup = k => String(k).split('').map(c => SUP[c]).join('');
  const fmt = n => n.toLocaleString('en-US');
  const ordinal = k => k + (k % 100 > 10 && k % 100 < 14 ? 'th' : ['th', 'st', 'nd', 'rd'][k % 10] || 'th');
  const prime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const factors = n => { const f = []; for (let d = 2; d * d <= n; d++) { let e = 0; while (n % d === 0) { n /= d; e++; } if (e) f.push([d, e]); } if (n > 1) f.push([n, 1]); return f; };
  const divisors = n => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
  const digits = n => String(n).split('').map(Number);
  const rev = n => +String(n).split('').reverse().join('');
  const roman = n => { let s = ''; for (const [v, r] of [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= v) { s += r; n -= v; } return s; };
  const seq = (f, max = 1100) => { const m = new Map(); for (let k = 1; ; k++) { const v = f(k); if (v > max) break; m.set(v, k); } return m; };
  const TRI = seq(k => k * (k + 1) / 2), SQ = seq(k => k * k), CUBE = seq(k => k * k * k), PYR = seq(k => k * (k + 1) * (2 * k + 1) / 6), TET = seq(k => k * (k + 1) * (k + 2) / 6);
  const HEX = seq(k => 3 * k * (k - 1) + 1), PENT = seq(k => k * (3 * k - 1) / 2), PRON = seq(k => k * (k + 1)), POW2 = seq(k => 2 ** k);
  const FIB = [1, 2], LUC = [1, 3]; while (FIB.at(-1) < 1100) FIB.push(FIB.at(-1) + FIB.at(-2)); while (LUC.at(-1) < 1100) LUC.push(LUC.at(-1) + LUC.at(-2));
  const CATALAN = { 14: 4, 132: 6, 429: 7 }, BELL = { 203: 6, 877: 7 }, HIGHLY = new Set([48, 180]);
  const PRIMES = []; for (let i = 2; i < 2200; i++) if (prime(i)) PRIMES.push(i);
  const period = n => { let k = 1, r = 10 % n; while (r !== 1) { r = r * 10 % n; k++; } return k; };   // n must share no factor with 10
  const collatz = n => { let s = 0, top = n; while (n !== 1) { n = n % 2 ? 3 * n + 1 : n / 2; s++; if (n > top) top = n; } return [s, top]; };
  const twoSquares = n => { const w = []; for (let a = 1; 2 * a * a <= n; a++) { const b = Math.round(Math.sqrt(n - a * a)); if (b >= a && a * a + b * b === n) w.push([a, b]); } return w; };
  const twoCubes = n => { for (let a = 1; 2 * a ** 3 <= n; a++) { const b = Math.round(Math.cbrt(n - a ** 3)); if (b >= a && a ** 3 + b ** 3 === n) return [a, b]; } return null; };
  const fourSquares = n => { for (let a = Math.floor(Math.sqrt(n)); a >= 1; a--) for (let b = Math.min(a, Math.floor(Math.sqrt(n - a * a))); b >= 1; b--) for (let c = Math.min(b, Math.floor(Math.sqrt(n - a * a - b * b))); c >= 1; c--) { const d = Math.round(Math.sqrt(n - a * a - b * b - c * c)); if (d >= 1 && d <= c && a * a + b * b + c * c + d * d === n) return [a, b, c, d]; } return null; };
  const needsFour = n => { while (n % 4 === 0) n /= 4; return n % 8 === 7; };
  const gaussPolygon = n => { if (n < 3) return false; while (n % 2 === 0) n /= 2; for (const p of [3, 5, 17, 257]) if (n % p === 0) n /= p; return n === 1; };
  const happy = n => { const seen = new Set(); while (n !== 1 && !seen.has(n)) { seen.add(n); n = digits(n).reduce((s, d) => s + d * d, 0); } return n === 1; };
  const kaprekar = n => { const s = String(n * n); for (let i = 1; i < s.length; i++) { const a = +s.slice(0, i), b = +s.slice(i); if (b > 0 && a + b === n) return [s.slice(0, i), s.slice(i)]; } return null; };

  function candidates(n) {
    const out = [], add = (score, group, text) => out.push({ score, group, text });
    const f = factors(n), isP = f.length === 1 && f[0][1] === 1, dg = digits(n), dv = divisors(n), sigma = dv.reduce((a, b) => a + b, 0) - n;
    // shapes and famous sequences
    if (dg.length === 3 && dg.reduce((s, d) => s + d ** 3, 0) === n) add(92, 'digits', `The sum of the cubes of its own digits: ${dg.map(d => d + '³').join(' + ')}. Only four three-digit numbers can do this.`);
    if (dg.length === 3 && dg[0] + dg[1] ** 2 + dg[2] ** 3 === n) add(85, 'digits', `${dg[0]}¹ + ${dg[1]}² + ${dg[2]}³: its own digits, raised to the powers 1, 2 and 3.`);
    if (POW2.has(n)) add(90, 'power', `2${sup(POW2.get(n))}: start from 1 and double it ${POW2.get(n)} times. In binary it is a 1 followed by ${POW2.get(n)} zeros.`);
    if (POW2.has(n + 1) && n > 3) add(isP ? 91 : 60, 'power', isP ? `A Mersenne prime: 2${sup(POW2.get(n + 1))} − 1. The largest primes ever found are all of this kind.` : `One less than 2${sup(POW2.get(n + 1))}, so in binary it is ${POW2.get(n + 1)} ones in a row.`);
    const fi = FIB.indexOf(n); if (fi > 1) add(88, 'fib', `A Fibonacci number: ${FIB[fi - 2]} + ${FIB[fi - 1]}, the two before it in the sequence 1, 1, 2, 3, 5, 8, 13…`);
    const li = LUC.indexOf(n); if (li > 3) add(60, 'fib', `A Lucas number: ${LUC[li - 2]} + ${LUC[li - 1]}, in the sequence 2, 1, 3, 4, 7, 11… where each is the sum of the two before.`);
    if (CUBE.has(n)) { const k = CUBE.get(n); add(86, 'cube', `${k}³ = ${k} × ${k} × ${k}: a cube of blocks, ${k} along every edge.`); }
    if (SQ.has(n)) {
      const k = SQ.get(n);
      if (TRI.has(k) && k > 1) add(84, 'square', `${k}², and also 1³ + 2³ + … + ${TRI.get(k)}³. Add up the first few cubes and you always get a square.`);
      else if (SQ.has(k)) add(80, 'square', `${SQ.get(k)}⁴: ${SQ.get(k)} multiplied by itself four times over, and so the square of a square (${k}²).`);
      else add(72, 'square', `${k}² = ${k} × ${k}. It is also the sum of the first ${k} odd numbers, as every square is.`);
    }
    for (const [b, e] of [[3, 5], [2, 5], [2, 7], [2, 9]]) if (b ** e === n && !POW2.has(n)) add(80, 'power', `${b}${sup(e)}: ${b} multiplied by itself ${e} times over.`);
    if (TRI.has(n) && TRI.get(n) > 3) { const k = TRI.get(n); add(70, 'tri', `A triangular number: 1 + 2 + 3 + … + ${k}. That many balls make a triangle with ${k} along each side.`); }
    if (PYR.has(n) && PYR.get(n) > 2) { const k = PYR.get(n); add(68, 'pyr', `A pyramid number: ${k < 5 ? [1, 4, 9, 16].slice(0, k).join(' + ') : `1 + 4 + 9 + … + ${k}²`}. That many cannonballs stack into a square pyramid ${k} layers high.`); }
    if (TET.has(n) && TET.get(n) > 2) { const k = TET.get(n); add(62, 'pyr', `A tetrahedral number: that many balls pile into a three-sided pyramid ${k} layers high.`); }
    if (HEX.has(n) && HEX.get(n) > 1) { const k = HEX.get(n) - 1; add(58, 'hex', `A hexagon number: a honeycomb of ${k} ring${k > 1 ? 's' : ''} around a single cell has ${n} cells.`); }
    if (PENT.has(n) && PENT.get(n) > 2) add(50, 'pent', `A pentagonal number: that many dots make nested pentagons with ${PENT.get(n)} along each side.`);
    if (PRON.has(n) && PRON.get(n) > 2) { const k = PRON.get(n); add(44, 'tri', `${k} × ${k + 1}: two neighbors multiplied, and so twice a triangular number.`); }
    if (CATALAN[n]) add(75, 'count', `A Catalan number: the number of ways to match up ${CATALAN[n]} pairs of brackets correctly.`);
    if (BELL[n]) add(70, 'count', `A Bell number: the number of ways to split ${BELL[n]} things into groups.`);
    if (HIGHLY.has(n)) add(78, 'divisors', `It has ${dv.length} divisors, more than any smaller number.`);
    // curiosities in the digits
    if (n > 9 && String(n * n).endsWith(String(n))) add(85, 'digits', `Its square ends in itself: ${n}² = ${fmt(n * n)}.`);
    const kap = n > 9 && kaprekar(n); if (kap) add(82, 'digits', `A Kaprekar number: ${n}² = ${n * n}, and ${kap[0]} + ${kap[1]} = ${n}.`);
    if (n > 10 && rev(n) === n) {
      if (dg.every(d => d === dg[0])) add(70, 'pal', dg.length === 3 ? `${dg[0]} × 111, which makes it ${dg[0] * 3} × 37. Every three-digit number made of one repeated digit is a multiple of 37.` : `${dg[0]} × 11. Every two-digit number made of one repeated digit is a multiple of 11.`);
      else add(isP ? 74 : 66, 'pal', isP ? 'A palindromic prime: a prime that reads the same in both directions.' : 'A palindrome: it reads the same in both directions.');
    }
    // primes
    if (isP) {
      const k = PRIMES.indexOf(n) + 1, more = [];
      if (prime(n - 2) || prime(n + 2)) more.push(`Its twin, ${prime(n + 2) ? n + 2 : n - 2}, is prime too. Nobody knows whether such pairs of twins go on forever.`);
      if (prime(2 * n + 1)) more.push(`Double it and add 1 and you get another prime, ${fmt(2 * n + 1)}.`);
      if (n > 12 && rev(n) !== n && prime(rev(n))) more.push(`Read it backwards and you get a different prime, ${rev(n)}.`);
      if (n % 4 === 1) { const [a, b] = twoSquares(n)[0]; more.push(`It is one more than a multiple of 4, so, as Fermat found, it is the sum of two squares: ${a}² + ${b}².`); }
      else if (n > 2) more.push('It is one less than a multiple of 4, so no two squares can ever add up to it.');
      if (n > 5 && period(n) === n - 1) more.push(`The decimals of 1/${n} run for ${n - 1} digits before they repeat, as long as they possibly could.`);
      const next = PRIMES[k]; if (next - n >= 12) more.push(`After it there is no prime until ${next}.`);
      add(64, 'prime', `The ${ordinal(k)} prime. ${more[k % more.length]}`);
    } else if (n > 1) {
      // how it is built from primes
      const exp = f.reduce((s, [, e]) => s + e, 0), prod = f.map(([p, e]) => e > 1 ? p + sup(e) : p).join(' × ');
      if (f.length === 2 && exp === 2) {
        const [p, q] = [f[0][0], f[1][0]];
        add(40, 'factors', [`Just two primes multiplied together: ${p} × ${q}. Enormous numbers of this kind guard secrets on the internet, because un-multiplying them is so hard.`,
          `${p} × ${q}: two primes and nothing else. So it has only four divisors: 1, ${p}, ${q} and itself.`,
          `Lay out ${n} tiles in a rectangle and, apart from one long row, there is only one way: ${p} by ${q}. Both are prime.`][n % 3]);
      } else if (f.length === 3 && exp === 3) add(39, 'factors', `${prod}: three different primes multiplied together, so it has exactly eight divisors.`);
      else if (!SQ.has(n) && !CUBE.has(n) && !POW2.has(n)) add(dv.length >= 16 ? 43 : 27, 'factors', `As a product of primes it is ${prod}, which gives it ${dv.length} divisors${dv.length >= 16 ? ', an unusually large number' : ''}.`);
      if (sigma > n) add(36, 'divisors', `Its smaller divisors add up to ${fmt(sigma)}, more than itself. The Greeks called such numbers abundant.`);
    }
    // sums
    const ts = twoSquares(n); if (ts.length > 1 && !isP) add(55, 'sums', `A sum of two squares in ${ts.length === 2 ? 'two' : 'three'} ways: ${ts.map(([a, b]) => `${a}² + ${b}²`).join(', ')}.`);
    const tc = twoCubes(n); if (tc && n > 2 && !out.some(x => x.score === 92)) add(57, 'sums', `A sum of two cubes: ${tc[0]}³ + ${tc[1]}³.`);
    if (needsFour(n)) { const q = fourSquares(n); if (q) add(42, 'sums', `Three squares are never enough to make it. It takes four: ${q.map(a => a + '²').join(' + ')}. No number ever needs more than four.`); }
    if (gaussPolygon(n) && n > 6) add(48, 'polygon', `A regular polygon with ${n} sides can be drawn with nothing but ruler and compass. Gauss found the rule for which ones can.`);
    if (n % 4 === 2 && n > 2) add(31, 'squares', 'It can never be the difference of two squares. No number that is twice an odd number can.');
    if (n % 2 === 1 && n > 1 && !isP) add(26, 'squares', `${(n + 1) / 2}² − ${(n - 1) / 2}²: like every odd number, it is the gap between two neighboring squares.`);
    if (n % 2 === 0 && n > 6) { const w = []; for (const p of PRIMES) { if (p > n / 2) break; if (prime(n - p)) w.push(p); } add(24, 'sums', `Like every even number anyone has tried, it is a sum of two primes: ${w.at(-1)} + ${n - w.at(-1)}, for one. It can be done in ${w.length} way${w.length > 1 ? 's' : ''}.`); }
    // games and notations
    if (n > 1) { const [s, top] = collatz(n); add(s >= 100 ? 47 : 20, 'game', `Play “halve it if even, triple it and add 1 if odd” from here and you reach 1 in ${s} steps${top > 4 * n ? `, after climbing as high as ${fmt(top)}` : ''}. Nobody has proved that every number gets there.`); }
    if (n > 1 && happy(n)) add(30, 'game', 'A happy number: square its digits and add them up, do the same to the answer, and keep going. You arrive at 1.');
    if (n % 2 && n % 5 && n > 3 && !isP) add(25, 'decimal', `The decimals of 1/${n} repeat every ${period(n)} digits.`);
    const bin = n.toString(2); if (n > 8 && bin === bin.split('').reverse().join('') && !POW2.has(n + 1)) add(37, 'notation', `In binary it is ${bin}, a palindrome.`);
    const ro = roman(n); if (ro.length >= 8) add(28, 'notation', `In Roman numerals it is ${ro}.`);
    return out;
  }
  // Returns { text, more }: the fact, and the titles of the Wikipedia articles that tell the rest of the story.
  const fact = n => {
    if (NOTED[n]) return { text: NOTED[n], more: [MORE[n]] };
    // the dullest facts take turns, so neighbors do not all say the same thing
    const c = candidates(n).map(x => ({ ...x, rank: x.score < 45 ? x.score + (n * 7 + x.group.length * 5) % 12 : x.score })).sort((a, b) => b.rank - a.rank);
    const first = c[0], second = c.find(x => x.group !== first.group && (x.score >= 34 || first.score < 45) && first.text.length + x.text.length < 270);
    const shown = second ? [first, second] : [first];
    return { text: shown.map(x => x.text).join(' '), more: [...new Set(shown.map(x => topicOf(x.text)))] };
  };
  fact.all = { MORE, TOPICS, candidates, topicOf };   // for the checks
  return fact;
})();
const wikiUrl = title => 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
