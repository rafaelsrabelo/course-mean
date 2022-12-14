import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeType } from './mime-type.validator'
@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  private mode = 'create';
  private postId: string;
  post: Post;
  isLoading: boolean = false;
  form: FormGroup;
  imagePreview: any;
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'title': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'description': new FormControl(null, [Validators.required, Validators.minLength(5)]),
      'image': new FormControl(null, [Validators.required], [mimeType])
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')){
        this.mode = 'edit'
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.post = this.postsService.getPost(this.postId)
          // .subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: this.postId,
            title: this.post.title,
            description: this.post.description,
          };
        this.form.setValue({
          'title': this.post.title,
          'description': this.post.description
        });
        // })
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    })
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.description,
        this.form.value.image
      );
    } else {
      this.postsService.updatedPost(this.postId, this.form.value.title, this.form.value.description);
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    }
    reader.readAsDataURL(file);
  }
}

