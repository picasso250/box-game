from collections import deque
import random

def is_solvable(level):
    start_player = None
    start_boxes = []
    targets = []
    for i in range(len(level)):
        for j in range(len(level[i])):
            if level[i][j] == 4:
                start_player = (i, j)
            elif level[i][j] == 2:
                start_boxes.append((i, j))
            elif level[i][j] == 3:
                targets.append((i, j))

    if len(start_boxes) != len(targets):
        return False

    dirs = [(-1,0), (1,0), (0,-1), (0,1)]
    visited = set()
    queue = deque()
    initial_state = (start_player, tuple(sorted(start_boxes)))
    queue.append(initial_state)
    visited.add((start_player, tuple(sorted(start_boxes))))

    while queue:
        player, boxes = queue.popleft()

        if all(b in targets for b in boxes):
            return True

        for dx, dy in dirs:
            new_p = (player[0] + dx, player[1] + dy)

            if not (0 <= new_p[0] < len(level) and 0 <= new_p[1] < len(level[0])):
                continue
            if level[new_p[0]][new_p[1]] == 1:
                continue

            if new_p in boxes:
                new_b = (new_p[0] + dx, new_p[1] + dy)
                if (not (0 <= new_b[0] < len(level) and 0 <= new_b[1] < len(level[0])) or \
                    level[new_b[0]][new_b[1]] == 1 or \
                    new_b in boxes):
                    continue

                new_boxes = list(boxes)
                new_boxes.remove(new_p)
                new_boxes.append(new_b)
                new_boxes_sorted = tuple(sorted(new_boxes))
                new_player = new_p

                if is_deadlock(new_b, new_boxes_sorted, targets, level):
                    continue

                state = (new_player, new_boxes_sorted)
                if state not in visited:
                    visited.add(state)
                    queue.append(state)
            else:
                state = (new_p, tuple(sorted(boxes)))
                if state not in visited:
                    visited.add(state)
                    queue.append(state)

    return False

def is_deadlock(box_pos, boxes, targets, level):
    x, y = box_pos
    if box_pos in targets:
        return False
    left = level[x][y-1] == 1 if y > 0 else True
    right = level[x][y+1] == 1 if y < len(level[0])-1 else True
    up = level[x-1][y] == 1 if x > 0 else True
    down = level[x+1][y] == 1 if x < len(level)-1 else True
    if (left and up) or (left and down) or (right and up) or (right and down):
        return True
    return False

def generate_5x5_level():
    level = [[0 for _ in range(5)] for _ in range(5)]
    cells = [(i, j) for i in range(5) for j in range(5)]
    player, box, target = random.sample(cells, 3)
    level[player[0]][player[1]] = 4
    level[box[0]][box[1]] = 2
    level[target[0]][target[1]] = 3
    return level

while True:
    level = generate_5x5_level()
    if is_solvable(level):
        print("[")
        for row in level:
            print("    [%s]" % ", ".join(map(str, row)))
        print("]")
        break