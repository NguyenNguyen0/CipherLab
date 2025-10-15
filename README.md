# RSA
1. Select p=11, q=3
2. n = pxq = 11x3 = 33
3. φ(n) = (p-1)(q-1) = (11-1)(3-1) = 20
4. Select e: gcd(φ(n), e) = 1
   e = 3
5. Calculate: d = e^-1(mod φ(n))

    q=r1//r2;r = r1− q × r2; s = s1−q × s2; t = t1− q × t2


    | q   | r1 r2 | r   | t1 t2 | t   |
    | --- | :---: | --- | :---: | --- |
    | 6   | 20 3  | 2   |  0 1  | -6  |
    | 1   |  3 2  | 1   | 1 -6  | 7   |
    | 2   |  2 1  | 0   | -6 7  | -20 |
    |     |  1 0  |     | 7 -20 | t   |

    - t1 > 0 => d = t1
    - t1 < 0 => d = n - t1

6. Keys:
   PU = {e, n}
   PR = {d, n}
7. Encription

- confidentiality: C = M^e mod n
- authenticity: C = M^d mod n
- both: C = (M^d mod n / M)^e mod n

8. Decription

- confidentiality: P = C^e mod n
- authenticity: P = C^d mod n
- both: P = (C^d mod n / M)^e mod n


## fast modular exponentiation
9^17 mod 77 = ?;
17(10) = 10001(2)

| b[i] | p=p^2    | p=p mod 77      | p.z    | p = p mod 77  |
| ---- | -------- | --------------- | ------ | ------------- |
| 1    | 1        | 1               | 9      | 9 mod 77 = 9  |
| 0    | 9^2=81   | 81 mod77=4      | -      | 4             |
| 0    | 4^2=16   | 16 mod77=16     | -      | 16            |
| 0    | 16^2=256 | 256 mod 77 = 25 | -      | 25            |
| 1    | 25^2=625 | 625 mod 77 = 9  | 9x9=81 | 81 mod 77 = 4 |
