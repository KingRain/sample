export const SNIPPETS: Record<string, string> = {
  "1/1": `#include <stdio.h>

#define ROWS 4
#define COLS 7

int main() {
    int data[ROWS][COLS] = {
        {0,0,1,0,0,0,0},
        {1,1,1,1,0,1,0},
        {0,0,1,0,0,0,1},
        {0,0,1,0,1,0,0}
    };

    int rowParity[ROWS] = {0};
    int colParity[COLS] = {0};

    // Sender side: calculate parity
    for(int i=0;i<ROWS;i++)
        for(int j=0;j<COLS;j++)
            rowParity[i] ^= data[i][j];

    for(int j=0;j<COLS;j++)
        for(int i=0;i<ROWS;i++)
            colParity[j] ^= data[i][j];

    printf("Test Case 1:\\n");

    // Receiver side check
    int error = 0;

    for(int i=0;i<ROWS;i++){
        int sum = 0;
        for(int j=0;j<COLS;j++)
            sum ^= data[i][j];
        if(sum != rowParity[i])
            error = 1;
    }

    for(int j=0;j<COLS;j++){
        int sum = 0;
        for(int i=0;i<ROWS;i++)
            sum ^= data[i][j];
        if(sum != colParity[j])
            error = 1;
    }

    if(error)
        printf("Error Detected\\n");
    else
        printf("No Error\\n");

    // Test case 2 (corruption)
    data[0][0] = 1;
    data[1][1] = 1;

    printf("\\nTest Case 2 (Corrupted):\\n");

    error = 0;

    for(int i=0;i<ROWS;i++){
        int sum = 0;
        for(int j=0;j<COLS;j++)
            sum ^= data[i][j];
        if(sum != rowParity[i])
            error = 1;
    }

    for(int j=0;j<COLS;j++){
        int sum = 0;
        for(int i=0;i<ROWS;i++)
            sum ^= data[i][j];
        if(sum != colParity[j])
            error = 1;
    }

    if(error)
        printf("Error Detected\\n");
    else
        printf("No Error\\n");

    return 0;
}`,
  "1/2": `#include <stdio.h>

unsigned char checksum(unsigned char d[], int n){
    unsigned int s = 0;

    for(int i=0;i<n;i++){
        s += d[i];
        while(s > 255)
            s = (s & 255) + (s >> 8);
    }

    return ~s;
}

int main(){
    unsigned char d1[] = {160,12,171,20};
    int n = 4;

    unsigned char cs = checksum(d1, n);

    // Test Case 1
    unsigned int v = 0;
    for(int i=0;i<n;i++) v += d1[i];
    v += cs;

    while(v > 255)
        v = (v & 255) + (v >> 8);

    printf("Test Case 1: %s\\n", (v & 255) == 255 ? "No Error" : "Error");

    // Test Case 2 (corrupted data)
    unsigned char d2[] = {32,76,43,52};

    v = 0;
    for(int i=0;i<n;i++) v += d2[i];
    v += cs;

    while(v > 255)
        v = (v & 255) + (v >> 8);

    printf("Test Case 2: %s\\n", (v & 255) == 255 ? "No Error" : "Error");

    return 0;
}`,
  "1/3": `#include <stdio.h>
#include <string.h>

void divide(char d[], char g[]){
    int dl = strlen(d);
    int gl = strlen(g);

    for(int i=0;i<=dl-gl;i++){
        if(d[i] == '1'){
            for(int j=0;j<gl;j++){
                d[i+j] = (d[i+j] == g[j]) ? '0' : '1';
            }
        }
    }
}

int main(){
    char m[] = "1101011011";
    char g[] = "10011";

    char temp[50], code[50];

    strcpy(temp, m);
    strcat(temp, "0000"); // append zeros

    divide(temp, g);

    strcpy(code, m);
    strcat(code, &temp[strlen(m)]);

    printf("Codeword: %s\\n", code);

    // Test Case 1
    char t1[50];
    strcpy(t1, code);
    divide(t1, g);

    printf("Test Case 1: %s\\n",
           strstr(t1, "1") == NULL ? "No Error" : "Error");

    // Test Case 2 (flip bit)
    char t2[50];
    strcpy(t2, code);
    t2[0] = (t2[0] == '1') ? '0' : '1';

    divide(t2, g);

    printf("Test Case 2: %s\\n",
           strstr(t2, "1") == NULL ? "No Error" : "Error");

    return 0;
}`,
  "2/1": `#include <stdio.h>

int totalframes, k;
int transmissionCount = 0, retransmissionCount = 0;

int receiver(int frame) {
    transmissionCount++;

    if (transmissionCount % k == 0) {
        printf("Frame lost\\n");
        return -1;
    }

    printf("Frame received\\n");
    return frame;
}

void sender() {
    int frame = 0, sentFrames = 0, ack;

    while (sentFrames < totalframes) {

        ack = receiver(frame);

        if (ack == frame) {
            frame = 1 - frame;   // toggle sequence bit
            sentFrames++;
        } else {
            printf("Retransmitting frame\\n");
            retransmissionCount++;
        }
    }

    printf("Packets sent: %d\\n", transmissionCount);
    printf("Total retransmissions: %d\\n", retransmissionCount);
}

int main() {
    printf("Enter total frames: ");
    scanf("%d", &totalframes);

    printf("Enter value for k: ");
    scanf("%d", &k);

    sender();
    return 0;
}`,
  "2/2": `#include <stdio.h>

int totalframes, windowSize, k;
int transmissionCount = 0, retransmissionCount = 0;

int receiver(int frame, int received[]) {
    transmissionCount++;

    if (transmissionCount % k == 0) {
        printf("Frame %d lost\\n", frame);
        return -1;
    }

    if (!received[frame]) {
        received[frame] = 1;
        printf("Frame %d received\\n", frame);
        return frame;
    }

    return -1;
}

void sender() {
    int base = 0;
    int nextFrame = 0;

    int acked[200] = {0};
    int received[200] = {0};

    while (base < totalframes) {

        while (nextFrame < base + windowSize && nextFrame < totalframes) {
            if (!acked[nextFrame]) {
                int ack = receiver(nextFrame, received);

                if (ack != -1)
                    acked[ack] = 1;
                else {
                    retransmissionCount++;
                    printf("Retransmitting frame %d\\n", nextFrame);
                    receiver(nextFrame, received);
                    acked[nextFrame] = 1;
                }
            }
            nextFrame++;
        }

        while (acked[base] && base < totalframes) {
            base++;
        }
    }

    printf("Transmissions: %d\\n", transmissionCount);
    printf("Retransmissions: %d\\n", retransmissionCount);
}

int main() {
    printf("Enter total frames: ");
    scanf("%d", &totalframes);

    printf("Enter window size: ");
    scanf("%d", &windowSize);

    printf("Enter k: ");
    scanf("%d", &k);

    sender();
    return 0;
}`,
  "2/3": `#include <stdio.h>

int totalframes, windowSize, k;
int transmissionCount = 0, retransmissionCount = 0;

int receiver(int frame, int *expectedFrame) {
    transmissionCount++;

    if (transmissionCount % k == 0) {
        printf("Frame %d lost\\n", frame);
        return -1;
    }

    if (frame == *expectedFrame) {
        printf("Frame %d received\\n", frame);
        (*expectedFrame)++;
        return frame;
    }

    return -1;
}

void sender() {
    int base = 0, nextFrame = 0;
    int expectedFrame = 0;

    while (base < totalframes) {

        // Send window
        while (nextFrame < base + windowSize && nextFrame < totalframes) {
            int ack = receiver(nextFrame, &expectedFrame);

            if (ack == -1) {
                printf("Error detected, retransmitting from frame %d\\n", base);
                retransmissionCount++;

                nextFrame = base;   // Go back
                break;
            }

            nextFrame++;
        }

        base = expectedFrame;
    }

    printf("Transmissions: %d\\n", transmissionCount);
    printf("Retransmissions: %d\\n", retransmissionCount);
}

int main() {
    printf("Enter total frames: ");
    scanf("%d", &totalframes);

    printf("Enter window size: ");
    scanf("%d", &windowSize);

    printf("Enter k: ");
    scanf("%d", &k);

    sender();
    return 0;
}`,
  "3/1": `#include <stdio.h>

#define N 5
#define INF 999

void dvr(int cost[N][N]) {
    int dist[N][N];
    int i, j, k;

    // Initialize distance matrix
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
            dist[i][j] = cost[i][j];
        }
    }

    // Distance Vector (Floyd-Warshall style)
    for (k = 0; k < N; k++) {
        for (i = 0; i < N; i++) {
            for (j = 0; j < N; j++) {
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }

    // Print result
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
            if (dist[i][j] == INF)
                printf("INF ");
            else
                printf("%3d ", dist[i][j]);
        }
        printf("\\n");
    }
}

int main() {
    int cost[N][N] = {
        {0, 5, 2, 3, 6},
        {5, 0, 4, 8, 3},
        {2, 4, 0, 5, 4},
        {3, 8, 5, 0, 9},
        {6, 3, 4, 9, 0}
    };

    printf("Original Network:\\n");
    dvr(cost);

    // Link failure
    cost[1][4] = INF;
    cost[4][1] = INF;
    cost[2][4] = INF;
    cost[4][2] = INF;

    printf("\\nAfter Link Failure (B-E & C-E):\\n");
    dvr(cost);

    return 0;
}`,
  "3/2": `#include <stdio.h>

#define N 7
#define INF 999

int minDistance(int dist[], int visited[]) {
    int min = INF, min_index = -1;

    for (int i = 0; i < N; i++) {
        if (!visited[i] && dist[i] < min) {
            min = dist[i];
            min_index = i;
        }
    }
    return min_index;
}

void dijkstra(int graph[N][N], int src) {
    int dist[N], visited[N];

    for (int i = 0; i < N; i++) {
        dist[i] = INF;
        visited[i] = 0;
    }

    dist[src] = 0;

    for (int i = 0; i < N - 1; i++) {
        int u = minDistance(dist, visited);
        visited[u] = 1;

        for (int j = 0; j < N; j++) {
            if (!visited[j] && graph[u][j] &&
                dist[u] + graph[u][j] < dist[j]) {
                dist[j] = dist[u] + graph[u][j];
            }
        }
    }

    printf("Shortest distances from source node:\\n");
    for (int i = 0; i < N; i++) {
        printf("Node %d : %d\\n", i, dist[i]);
    }
}

int main() {
    int graph[N][N] = {
        {0,2,0,3,0,0,0},
        {2,0,5,4,0,0,0},
        {0,5,0,0,5,1,0},
        {3,4,0,0,5,0,0},
        {0,0,5,5,0,2,0},
        {0,0,1,0,2,0,3},
        {0,0,0,0,0,3,0}
    };

    dijkstra(graph, 0);

    return 0;
}`
};
