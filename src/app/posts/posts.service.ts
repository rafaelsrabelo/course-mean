import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, map } from 'rxjs';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  url: string = 'http://localhost:3000/'
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  getPosts() {
    this.http.get<{ message: string, posts: any }>(`${this.url}api/posts`)
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            title: post.title,
            description: post.description,
            id: post._id
          }
        })
      }))
      .subscribe(transformefPosts => {
        this.posts = transformefPosts;
        this.postsUpdated.next([...this.posts]);
      })
  };

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return { ...this.posts.find(p => p.id === id) };
  }

  addPost(title: string, description: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("description", description);
    postData.append("image", image, title);
    this.http.post<{ message: string, postId: string }>(`${this.url}api/posts`, postData).subscribe((data) => {
      const post = {
        id: data.postId, title: title, description: description
      }
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"])
    })
  }

  updatedPost(id: string, title: string, description: string) {
    const post: Post = { id: id, title: title, description: description };
    this.http.put(`${this.url}api/posts/` + id, post).subscribe(response => {
      const updatedPost = [...this.posts];
      const oldPostIndex = updatedPost.findIndex(p => p.id === post.id);
      updatedPost[oldPostIndex] = post;
      this.posts = updatedPost;
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"])
    });
  }

  deletePost(postId: string) {
    this.http.delete(`${this.url}api/posts/` + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts])
      })
  }

}

