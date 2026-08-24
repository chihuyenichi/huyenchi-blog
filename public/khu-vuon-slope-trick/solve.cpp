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

    // Góc nhìn "mảng hiệu của slope":
    // - left_breaks[p] lưu event tại breakpoint thô p làm slope giảm thêm ở nửa trái,
    //   tương ứng mảnh w * max(p - x, 0)
    // - right_breaks[p] lưu event tại breakpoint thô p làm slope tăng thêm ở nửa phải,
    //   tương ứng mảnh w * max(x - p, 0)
    // Nói cách khác, ta không lưu trực tiếp F(x), mà lưu "mảng hiệu của slope" của F.
    // Vì vậy các phép cộng hàm kiểu max(...) chỉ là thêm/xóa/chuyển event tại breakpoint.

    // Cộng thêm trọng số vào một breakpoint thô; nếu đã có thì gộp lại.
    static void add_weight(map<ll, ll>& mp, ll pos, ll weight) {
        if (weight == 0) return;
        mp[pos] += weight;
    }

    // Bớt một phần (hoặc toàn bộ) trọng số tại một breakpoint thô.
    static void remove_weight(map<ll, ll>& mp, map<ll, ll>::iterator it, ll weight) {
        if (it->second == weight) {
            mp.erase(it);
        } else {
            it->second -= weight;
        }
    }

    // Dời ngang toàn bộ hàm bằng lazy shift.
    // Sau khi xử lý i bồn, shift đúng là tổng d[1] + ... + d[i]:
    // từ K_i(x) = H_i(x - d[i]) suy ra toàn bộ breakpoint chỉ bị tịnh tiến ngang.
    // Ta giữ nguyên các khóa thô trong map và đổi hệ quy chiếu:
    // vị trí thật = vị trí thô + shift.
    void shift_all(ll delta) {
        shift += delta;
    }

    // Thêm weight * max(a - x, 0).
    // Nhìn như update đoạn trên "mảng hiệu của slope":
    // - slope bị giảm thêm weight trên toàn bộ nửa trục (-inf, a)
    // - vì ta lưu mảng hiệu, nếu không vướng đáy thì chỉ cần thêm 1 event trái tại a
    // Ở đây actual_pos là tọa độ thật, còn pos = actual_pos - shift là tọa độ thô.
    // Nếu a vượt qua breakpoint phải gần đáy nhất r thì đáy bị đẩy sang trái, nên
    // phải rebalance thay vì chỉ cộng event đơn thuần. Ta dùng:
    // max(x-r,0) + max(a-x,0) = (a-r) + max(r-x,0) + max(x-a,0).
    // Nghĩa là:
    // - cộng ngay (a-r) * weight vào min_value
    // - chuyển một phần event ở biên đáy từ phải sang trái
    // - đồng thời thêm event mới tại a
    void add_a_minus_x(ll actual_pos, ll weight) {
        ll pos = actual_pos - shift;
        while (weight > 0) {
            if (!right_breaks.empty() && right_breaks.begin()->first < pos) {
                auto it = right_breaks.begin();
                ll split_pos = it->first;
                ll take = min(weight, it->second);

                // Phần tăng bắt buộc của giá trị nhỏ nhất khi đoạn đáy dịch sang trái.
                min_value += (pos - split_pos) * take;

                remove_weight(right_breaks, it, take);
                right_weight -= take;

                // Khối lượng ở biên đáy cũ nay trở thành event trái.
                add_weight(left_breaks, split_pos, take);
                left_weight += take;

                // Đồng thời thêm event phải mới tại a cho phần khối lượng vừa rebalance.
                add_weight(right_breaks, pos, take);
                right_weight += take;

                weight -= take;
            } else {
                // Không vướng vùng đáy: đây đúng là thao tác "update (-inf, a)"
                // được nén lại thành 1 event trái tại a trong mảng hiệu slope.
                add_weight(left_breaks, pos, weight);
                left_weight += weight;
                break;
            }
        }
    }

    // Thêm weight * max(x - a, 0).
    // Nhìn như update đoạn trên "mảng hiệu của slope":
    // - slope bị tăng thêm weight trên toàn bộ nửa trục (a, +inf)
    // - vì ta lưu mảng hiệu, nếu không vướng đáy thì chỉ cần thêm 1 event phải tại a
    // Ở đây actual_pos là tọa độ thật, còn pos = actual_pos - shift là tọa độ thô.
    // Nếu a vượt qua breakpoint trái gần đáy nhất l thì đáy bị đẩy sang phải, nên
    // phải rebalance thay vì chỉ cộng event đơn thuần. Ta dùng:
    // max(l-x,0) + max(x-a,0) = (l-a) + max(x-l,0) + max(a-x,0).
    // Nghĩa là:
    // - cộng ngay (l-a) * weight vào min_value
    // - chuyển một phần event ở biên đáy từ trái sang phải
    // - đồng thời thêm event mới tại a
    void add_x_minus_a(ll actual_pos, ll weight) {
        ll pos = actual_pos - shift;
        while (weight > 0) {
            if (!left_breaks.empty()) {
                auto it = prev(left_breaks.end());
                if (it->first > pos) {
                    ll split_pos = it->first;
                    ll take = min(weight, it->second);

                    // Phần tăng bắt buộc của giá trị nhỏ nhất khi đoạn đáy dịch sang phải.
                    min_value += (split_pos - pos) * take;

                    remove_weight(left_breaks, it, take);
                    left_weight -= take;

                    // Khối lượng ở biên đáy cũ nay trở thành event phải.
                    add_weight(right_breaks, split_pos, take);
                    right_weight += take;

                    // Đồng thời thêm event trái mới tại a cho phần khối lượng vừa rebalance.
                    add_weight(left_breaks, pos, take);
                    left_weight += take;

                    weight -= take;
                    continue;
                }
            }

            // Không vướng vùng đáy: đây đúng là thao tác "update (a, +inf)"
            // được nén lại thành 1 event phải tại a trong mảng hiệu slope.
            add_weight(right_breaks, pos, weight);
            right_weight += weight;
            break;
        }
    }

    // Cộng |x - a| tức là thêm đúng 2 event đổi slope tại a:
    // một event cho nửa trái và một event cho nửa phải.
    void add_abs(ll actual_pos, ll weight) {
        add_a_minus_x(actual_pos, weight);
        add_x_minus_a(actual_pos, weight);
    }

    // Kẹp đuôi trái: xóa bớt các event ngoài cùng để slope phía trái
    // không âm quá mức cho phép.
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

    // Kẹp đuôi phải: xóa bớt các event ngoài cùng để slope phía phải
    // không dương quá mức cho phép.
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

    // Khôi phục giá trị hàm tại x từ:
    // - min_value: giá trị tại vùng đáy
    // - left_breaks, right_breaks: mảng hiệu của slope
    // Trước hết đổi x thật sang tọa độ thô: raw_x = x - shift.
    // Sau đó "tích phân lại" các event:
    // - mỗi event trái (p, w) đóng góp w * max(p - raw_x, 0)
    // - mỗi event phải (p, w) đóng góp w * max(raw_x - p, 0)
    ll value_at(ll x) const {
        ll result = min_value;
        ll raw_x = x - shift;

        for (const auto& [pos, weight] : left_breaks) {
            if (pos > raw_x) {
                // raw_x nằm bên trái breakpoint p, nên event trái còn tác dụng.
                result += (pos - raw_x) * weight;
            }
        }

        for (const auto& [pos, weight] : right_breaks) {
            if (pos < raw_x) {
                // raw_x nằm bên phải breakpoint p, nên event phải còn tác dụng.
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

    // Hàm gốc: thêm 2 event mô tả chi phí mua/bỏ đất.
    st.add_a_minus_x(0, Y);
    st.add_x_minus_a(0, X);

    for (int i = 1; i <= n; ++i) {
        // 1) xóa bớt event ở hai đuôi để kẹp slope vào [-Y, X]
        // 2) dời toàn bộ event theo d[i], tức cộng d[i] vào lazy shift
        // 3) thêm 2 event mới cho chi phí Z * |x|
        st.trim_left(Y);
        st.trim_right(X);
        st.shift_all(d[i]);
        st.add_abs(0, Z);
    }

    cout << st.value_at(0) << '\n';
    return 0;
}
