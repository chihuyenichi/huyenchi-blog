#include <bits/stdc++.h>
using namespace std;

#define ll long long
#define nmax ((int) 1e5 + 2)  // Maximum array size + 2
#define block_size ((int) 5e2)  // Block size for square root decomposition (500)

// Linked list node structure for maintaining order during rotation
struct single_list {
    int id;        // Original position in array a
    int next, prev; // Indices in a_link array (not values)

    bool operator==(const single_list &other) const {
    return id == other.id && next == other.next && prev == other.prev;
}
}  a_link[nmax], b_link[nmax];  // a_link: doubly linked list nodes, b_link: unused

// Block struct for square root decomposition
struct block_struct {
    int freq[nmax];    // Frequency of each value [1..nmax] in this block
    int pointer[2];    // pointer[0]: start node, pointer[1]: end node of block
} block[nmax / block_size + 1];  // Array of blocks (201 blocks for nmax=100000, block_size=500)

// Update frequency count of a value in a block
// x: block reference, val: value to update, d: delta (+1 to add, -1 to remove)
void block_chfreq(block_struct &x, int val, int d) {
    x.freq[val] += d;
}


int a[nmax];  // Main array storing input values
int n;        // Array size


// Get block ID that position i belongs to
// block_getid(i) returns which block index contains position i
int block_getid(int i) {
    return i / block_size;  // 0-499 -> block 0, 500-999 -> block 1, etc.
}

int Q;  // Number of queries
array < int, 4 > qs[nmax];  // Store queries: [type, l, r, value]

// Update linked list relationships for node at position id
// Sets next pointer if next != -2, updates both forward and backward links
void fix_relation_linked(int id, int next, int prev) {
    if (next != -2) {
        a_link[id].next = next;
        a_link[a_link[id].next].prev = id;  // Update backward link of next node
    }

    if (prev != -2) {
        a_link[id].prev = prev;
        a_link[a_link[id].prev].next = id;  // Update forward link of prev node
    }
}
// Get starting position of block id (1-indexed)
int block_idStart(int id) {
    return max(1, block_size * id);
}

// Get ending position of block id (1-indexed)
int block_idEnd(int id) {
    return min(n, block_size * (id + 1) - 1);
}

// Find node ID at position l using block pointer as starting point
// Traverses linked list from block start until reaching position l
int iterator_from_pos(int l) {
    int id = block_getid(l);
    int begin = block[id].pointer[0];  // Start from first node in block
    for (int i = block_idStart(id) + 1; i <= l; ++i) {  // Traverse until position l
        begin = a_link[begin].next;
    }
    return begin;  // Return node ID at position l
}

// Rotate elements in range [l, r] within a single block
// Moves last element to front: [l..r] -> [r, l, l+1, ..., r-1]
void rot_segment_inside(int l, int r) {
    int blockid = block_getid(l);

    int old_begin = iterator_from_pos(l);  // Node ID at position l
    int old_last = iterator_from_pos(r);   // Node ID at position r

    // Step 1: Move last element to be before first element
    // Connect: old_last -> old_begin (-> what was before old_begin)
    auto tmp = a_link[old_last];
    fix_relation_linked(old_last, old_begin, a_link[old_begin].prev);

    // Step 2: Remove last element from end, connect previous -> next
    int old_last_2 = tmp.prev;  // Element that was before old_last
    fix_relation_linked(old_last_2, tmp.next, -2);  // Connect it to element after old_last

    // Step 3: Update block pointers if rotation affects block boundaries
    if (l == block_idStart(blockid)) block[blockid].pointer[0] = old_last;
    if (r == block_idEnd(blockid)) block[blockid].pointer[1] = old_last_2;
}

// Rotate elements in range [l, r] (may span multiple blocks)
void rot_segment(int l, int r) {
    int l_blockid = block_getid(l);
    int r_blockid = block_getid(r);

    // CASE 1: Both l and r in same block
    if (l_blockid == r_blockid) {
        if (l != r)  // Only rotate if more than 1 element
            rot_segment_inside(l, r);
    }
    // CASE 2: l and r in different blocks
    else {
        // Step 1: Handle middle blocks (blocks between l_block and r_block)
        // These blocks rotate completely: move first element to end, second becomes first
        for (int b_id = l_blockid + 1; b_id < r_blockid; ++b_id) {
            int old_begin = block[b_id].pointer[0];  // Current first node
            int old_last = block[b_id].pointer[1];   // Current last node

            // For middle blocks: rotate completely, last element becomes first
            // Remove old last from frequency
            block_chfreq(block[b_id], a[a_link[old_last].id], -1);

            // Update first, last nodes by its previous
            block[b_id].pointer[0] = a_link[block[b_id].pointer[0]].prev;
            block[b_id].pointer[1] = a_link[block[b_id].pointer[1]].prev;

            // Add new first to frequency
            block_chfreq(block[b_id], a[a_link[a_link[old_begin].prev].id], 1);
        }

        int old_begin, old_last;  // Node IDs of elements at positions l and r

        // Find exact nodes at positions l and r
        old_begin = iterator_from_pos(l);
        old_last = iterator_from_pos(r);

        // Step 2: Update frequencies for left and right boundary blocks
        // Remove: last element of left block, r-th element from right block
        block_chfreq(block[l_blockid], a[a_link[block[l_blockid].pointer[1]].id], -1);
        block_chfreq(block[r_blockid], a[a_link[old_last].id], -1);

        // Add: element before pointer[0] of right block becomes new element in right block
        {
            int last_prev_r_blockid = a_link[block[r_blockid].pointer[0]].prev;
            block_chfreq(block[r_blockid], a[a_link[last_prev_r_blockid].id], 1);
        }

        // Add: r-th element moves to left block
        block_chfreq(block[l_blockid], a[a_link[old_last].id], 1);

        // Step 3: Reorganize linked list
        // Move old_last from position r to before old_begin
        auto tmp = a_link[old_last];
        int old_last_2 = tmp.prev;  // Element before old_last

        fix_relation_linked(old_last, old_begin, a_link[old_begin].prev);
        fix_relation_linked(old_last_2, tmp.next, -2);

        // Update block pointers if l/r at block boundaries
        if (l == block_idStart(l_blockid)) block[l_blockid].pointer[0] = old_last;
        if (r == block_idEnd(r_blockid)) block[r_blockid].pointer[1] = old_last_2;

        // Step 4: Update remaining block pointers for consistency
        // Find actual node at end of left block after rotation
        int last_pos = block_idEnd(l_blockid);
        block[l_blockid].pointer[1] = iterator_from_pos(last_pos);

        // Find actual node at start of right block after rotation
        int prev_first_pos = block[r_blockid - 1].pointer[1];
        block[r_blockid].pointer[0] = a_link[prev_first_pos].next;
    }
}

// Count occurrences of value x in range [l, r] within a single block
// Traverses linked list from position l to r, counting matches
int count_segment_inside(int l, int r, int x) {
    int l_blockid = block_getid(l);
    int ans = 0;
    int begin = block_idStart(l_blockid);
    int start = iterator_from_pos(l);  // Get node at position l
    ans += a[a_link[start].id] == x;   // Check if element at l matches x

    for (int i = l + 1; i <= r; ++i) {
        start = a_link[start].next;     // Move to next node
        ans += a[a_link[start].id] == x;  // Check if matches
    }

    return ans;
}

// Count occurrences of value x in range [l, r] (may span multiple blocks)
int count_segment(int l, int r, int x) {
    int l_blockid = block_getid(l);
    int r_blockid = block_getid(r);

    // CASE 1: Both l and r in same block - just scan that range
    if (l_blockid == r_blockid) {
        int ans = count_segment_inside(l, r, x);
        return ans;
    }
    // CASE 2: l and r in different blocks
    else {
        int ans = 0;

        // Add counts from all complete middle blocks
        for (int i = l_blockid + 1; i < r_blockid; ++i) {
            ans += block[i].freq[x];  // Use precomputed frequency
        }

        // Add count from partial left block (from l to end of block)
        ans += count_segment_inside(l, block_idEnd(l_blockid), x);

        // Add count from partial right block (from start of block to r)
        ans += count_segment_inside(block_idStart(r_blockid), r, x);

        return ans;
    }
}

int main(){

    cin >> n;
    // Initialize sentinel nodes for linked list boundaries
    a_link[0].next = 1;        // Node 0 points to first element
    a_link[n + 1].prev = n;    // Node n+1 is after last element

    // Read array and initialize linked list structure
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        a_link[i].id = i;           // Node i represents array position i
        a_link[i].next = i + 1;     // Forward link: i -> i+1
        a_link[i].prev = i - 1;     // Backward link: i <- i-1
        block[block_getid(i)].freq[a[i]]++;  // Count element in block frequency
    }

    // Initialize block pointers to mark block boundaries
    for (int b_id = 0; b_id <= n / block_size; ++b_id) {
        block[b_id].pointer[0] = max(1, block_size * b_id);          // First position in block
        block[b_id].pointer[1] = min(n, block_size * (b_id + 1) - 1);  // Last position in block
    }

    cin >> Q;
    int lastans = 0;  // Store result of last query for parameter decoding

    // Step 1: Read all queries and store them (prepare phase)
    for (int i = 0; i < Q; ++i) {
        int type;
        cin >> type;
        auto &[x, y, z, t] = qs[i];
        cin >> y >> z;
        if (type == 2) cin >> t;  // Type 2 queries have value parameter
        x = type;  // Store query type
    }

    // Step 2: Execute queries with online parameter decoding
    for (int _i = 0; _i < Q; ++_i) {
        auto [_, l, r, val] = qs[_i];

        // Decode parameters using last answer (online judge encoding)
        l = (l + lastans - 1) % n + 1;
        r = (r + lastans - 1) % n + 1;
        if (l > r) swap(l, r);

        if (qs[_i][0] == 1) {
            // Type 1: Rotate range [l, r]
            rot_segment(l, r);
        }
        else {
            // Type 2: Count occurrences of value in range [l, r]
            val = (val + lastans - 1) % n + 1;  // Decode value parameter
            int ans = count_segment(l, r, val);
            cout << ans << '\n';
            lastans = ans;  // Store for next query decoding
        }
    }

    return 0;
}
