// Bài 3 — DÂY NGẮN NHẤT
// Model solution. Thuật toán bám đúng README.md mục 6 (không tự nghĩ thuật toán khác).
//
// Ý tưởng (README mục 2.3, Lemma 1): vì v ^ v = 0 nên số lần chẵn của mỗi giá trị
// triệt tiêu trong XOR. Tách parity: c_v = eps_v + 2*t_v. Tập S (các giá trị xuất
// hiện số lần lẻ) quyết định XOR; các cặp t_v chỉ dùng để bù tổng.
// Với S cố định, chi phí = |S| + 2 * mc((m - sigma(S)) / 2)   (Lemma 2)
// và mc tính bằng tham lam cho hệ coin Fibonacci                (Lemma 3)
//
// XOR là phép cộng trên GF(2): 58 giá trị Fibonacci <= 1e12 -> hệ 40 phương trình,
// 58 ẩn số, rank = 40, nullity = 18  => chỉ 2^18 = 262144 tap con can duyet (Lemma 4).

#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using ull = unsigned long long;

vector<ll> fib;                    // 58 gia tri Fibonacci duong <= 1e12
vector<ull> dep;                   // 18 mat na phu thuoc (XOR cac fib theo bit = 0)
map<int, pair<ull, ull>> basis;    // bit dan -> (gia tri rut gon, mat na chi so)

// mc(Q): so Fibonacci toi thieu (duoc phep lap) co tong bang Q.
// Tham lam: lay lien tiep so Fibonacci lon nhat <= phan du (Lemma 3).
int minCoins(ll Q) {
    int c = 0;
    int i = (int)fib.size() - 1;
    while (Q > 0) {
        while (i > 0 && fib[i] > Q) i--;
        Q -= fib[i];
        c++;
    }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // De bai khong nhac file .INP/.OUT => dung stdin/stdout, khong freopen.

    const ll LIM = 1000000000000LL;
    ll a = 1, b = 2;
    while (a <= LIM) {
        fib.push_back(a);
        ll t = a + b;
        a = b;
        b = t;
    }

    // Buoc 0: dung linear basis tren GF(2) kem mat na chi so.
    // Moi lan rut gon ve 0 => mat na phu thuoc (XOR = 0), day vao dep.
    for (int i = 0; i < (int)fib.size(); i++) {
        ull x = (ull)fib[i], m = 1ULL << i;
        while (x) {
            int hb = 63 - __builtin_clzll(x);
            auto it = basis.find(hb);
            if (it != basis.end()) {
                x ^= it->second.first;
                m ^= it->second.second;
            } else {
                basis[hb] = {x, m};
                break;
            }
        }
        if (x == 0) dep.push_back(m);
    }

    int T;
    cin >> T;
    while (T--) {
        ll m, nX;
        cin >> m >> nX;

        // Buoc 1: particular solution cho X ^ ... = nX
        ull x = (ull)nX, part = 0;
        bool ok = true;
        while (x) {
            int hb = 63 - __builtin_clzll(x);
            auto it = basis.find(hb);
            if (it == basis.end()) {
                ok = false;
                break;
            }
            x ^= it->second.first;
            part ^= it->second.second;
        }
        if (!ok) {
            cout << -1 << endl;
            continue;
        }

        // Buoc 2 + 3: duyet toan bo affine subspace (2^18 tap con)
        int D = (int)dep.size();
        int best = INT_MAX;
        for (int combo = 0; combo < (1 << D); combo++) {
            ull sm = part;
            for (int t = 0; t < D; t++) {
                if ((combo >> t) & 1) sm ^= dep[t];
            }

            ll s = 0;
            int cnt = __builtin_popcountll(sm);
            for (ull t = sm; t; t &= t - 1) {
                s += fib[__builtin_ctzll(t)];
            }

            if (s > m) continue;        // tong da vuot m, khong the sua
            ll rest = m - s;
            if (rest & 1) continue;     // phan cap luon dong gop so chan

            best = min(best, cnt + 2 * minCoins(rest / 2));
        }

        cout << (best == INT_MAX ? -1 : best) << endl;
    }

    return 0;
}
