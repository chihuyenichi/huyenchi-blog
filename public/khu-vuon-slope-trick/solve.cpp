#include <bits/stdc++.h>
using namespace std;

using ll = long long;

struct SlopeTrick {
    map<ll, ll> left_breaks;
    map<ll, ll> right_breaks;
    ll left_weight = 0;
    ll right_weight = 0;
    ll shift = 0;
    ll min_value = 0;

    static void add_weight(map<ll, ll>& mp, ll pos, ll weight) {
        if (weight == 0) return;
        mp[pos] += weight;
    }

    static void remove_weight(map<ll, ll>& mp, map<ll, ll>::iterator it, ll weight) {
        if (it->second == weight) {
            mp.erase(it);
        } else {
            it->second -= weight;
        }
    }

    void shift_all(ll delta) {
        shift += delta;
    }

    void add_a_minus_x(ll actual_pos, ll weight) {
        ll pos = actual_pos - shift;
        while (weight > 0) {
            if (!right_breaks.empty() && right_breaks.begin()->first < pos) {
                auto it = right_breaks.begin();
                ll split_pos = it->first;
                ll take = min(weight, it->second);

                min_value += (pos - split_pos) * take;

                remove_weight(right_breaks, it, take);
                right_weight -= take;

                add_weight(left_breaks, split_pos, take);
                left_weight += take;

                add_weight(right_breaks, pos, take);
                right_weight += take;

                weight -= take;
            } else {

                add_weight(left_breaks, pos, weight);
                left_weight += weight;
                break;
            }
        }
    }

    void add_x_minus_a(ll actual_pos, ll weight) {
        ll pos = actual_pos - shift;
        while (weight > 0) {
            if (!left_breaks.empty()) {
                auto it = prev(left_breaks.end());
                if (it->first > pos) {
                    ll split_pos = it->first;
                    ll take = min(weight, it->second);

                    min_value += (split_pos - pos) * take;

                    remove_weight(left_breaks, it, take);
                    left_weight -= take;

                    add_weight(right_breaks, split_pos, take);
                    right_weight += take;

                    add_weight(left_breaks, pos, take);
                    left_weight += take;

                    weight -= take;
                    continue;
                }
            }

            add_weight(right_breaks, pos, weight);
            right_weight += weight;
            break;
        }
    }

    void add_abs(ll actual_pos, ll weight) {
        add_a_minus_x(actual_pos, weight);
        add_x_minus_a(actual_pos, weight);
    }

    void trim_left(ll limit) {
        ll excess = left_weight - limit;
        while (excess > 0) {
            auto it = left_breaks.begin();
            ll take = min(excess, it->second);
            remove_weight(left_breaks, it, take);
            left_weight -= take;
            excess -= take;
        }
    }

    void trim_right(ll limit) {
        ll excess = right_weight - limit;
        while (excess > 0) {
            auto it = prev(right_breaks.end());
            ll take = min(excess, it->second);
            remove_weight(right_breaks, it, take);
            right_weight -= take;
            excess -= take;
        }
    }

    ll value_at(ll x) const {
        ll result = min_value;
        ll raw_x = x - shift;

        for (const auto& [pos, weight] : left_breaks) {
            if (pos > raw_x) {

                result += (pos - raw_x) * weight;
            }
        }

        for (const auto& [pos, weight] : right_breaks) {
            if (pos < raw_x) {

                result += (raw_x - pos) * weight;
            }
        }

        return result;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    ll X, Y, Z;
    cin >> n >> X >> Y >> Z;

    vector<ll> d(n + 1);
    for (int i = 1; i <= n; ++i) {
        ll A, B;
        cin >> A >> B;
        d[i] = A - B;
    }

    SlopeTrick st;

    st.add_a_minus_x(0, Y);
    st.add_x_minus_a(0, X);

    for (int i = 1; i <= n; ++i) {

        st.trim_left(Y);
        st.trim_right(X);
        st.shift_all(d[i]);
        st.add_abs(0, Z);
    }

    cout << st.value_at(0) << '\n';
    return 0;
}
