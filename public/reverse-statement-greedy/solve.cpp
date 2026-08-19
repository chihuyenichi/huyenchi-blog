#include <bits/stdc++.h>
using namespace std;

#define ll long long 
#define nmax ((int) 2e5) 

int n;
int a[nmax + 2];

bool check(int val) {
    // val: gia tri T, dac trung cho day : 2^{T - 1}, 2^{T - 2}, ..., 2^0 
    multiset < int > s;
    for (int i = 1; i <= n; ++i) s.insert(a[i]);
    
    for (int i = 1; i <= val && s.empty() == 0; ++i) {

        int x = *(prev(s.end()));
        ll x_t = val - i > 31 ? 2e9 : 1ll << (val - i);
        if (x_t >= x) {
            s.erase(prev(s.end()));
        }
        else {
            s.erase(prev(s.end()));
            s.insert(x - x_t);
        }
    }

    if (!s.empty()) return 0;
    return 1;
}

void huyenchi() {
    cin >> n;
    for (int i = 1; i <= n; ++i) cin >> a[i];

    int l = 1, r = n * 30;
    int res = -1;
    while (l <= r) {
        int mid = (l + r) / 2;
        if (check(mid)) {
            res = mid;
            r = mid - 1;
        }
        else l = mid + 1;
    }    

    cout << res << '\n';
}

int main(){

    ios_base:: sync_with_stdio(0);
    cin.tie(0); cout.tie(0);
    int nTest = 1;
    cin >> nTest;
    while (nTest--) {
        huyenchi();
    }

    return 0;
}