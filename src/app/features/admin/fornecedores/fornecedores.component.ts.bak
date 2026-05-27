import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { FornecedorResponse, IngredienteResponse } from '@core/models/models';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, ButtonModule, TableModule, DialogModule,
    InputTextModule, InputNumberModule, DropdownModule, TagModule, TabViewModule, CardModule
  ],
  template: `
    <div class="page-header">
      <h1>Fornecedores</h1>
      <button pButton label="Novo Fornecedor" icon="pi pi-plus" (click)="abrirNovo()"></button>
    </div>

    <p-tabView>
      <p-tabPanel header="Cadastro">
        <p-table [value]="fornecedores()" [loading]="loading()" styleClass="p-datatable-sm" [paginator]="true" [rows]="20">
          <ng-template pTemplate="header">
            <tr>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Status</th>
              <th style="width: 180px">Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-f>
            <tr>
              <td>{{ f.razaoSocial }}</td>
              <td>{{ f.cnpj }}</td>
              <td>{{ f.telefone || '-' }}</td>
              <td>{{ f.email || '-' }}</td>
              <td><p-tag [value]="f.status" [severity]="f.status === 'ATIVO' ? 'success' : 'danger'"></p-tag></td>
              <td>
                <button pButton icon="pi pi-list" class="p-button-text p-button-sm" pTooltip="Produtos" (click)="abrirProdutos(f)"></button>
                <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editar(f)"></button>
                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="remover(f)"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center">Nenhum fornecedor cadastrado</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>

      <p-tabPanel header="Cotação Comparativa">
        <div class="cotacao-filtro">
          <label>Selecione um ingrediente para comparar preços:</label>
          <p-dropdown [(ngModel)]="ingredienteSelecionado" [options]="ingredientes()" optionLabel="nome"
                      optionValue="id" placeholder="Selecione" [style]="{width: '350px'}" [filter]="true"
                      (onChange)="carregarCotacao()"></p-dropdown>
        </div>
        <p-table *ngIf="ingredienteSelecionado" [value]="cotacao()" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>#</th>
              <th>Fornecedor</th>
              <th>Preço</th>
              <th>Unidade</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-c let-i="rowIndex">
            <tr [class.melhor-preco]="i === 0">
              <td>
                <span *ngIf="i === 0" class="medal">🥇</span>
                <span *ngIf="i === 1">🥈</span>
                <span *ngIf="i === 2">🥉</span>
                <span *ngIf="i > 2">{{ i + 1 }}</span>
              </td>
              <td>{{ c.fornecedorRazaoSocial }}</td>
              <td><strong>{{ c.preco | currency:'BRL' }}</strong></td>
              <td>{{ c.unidadeVenda }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="4" class="text-center">Nenhum fornecedor cadastrado para este ingrediente</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>
    </p-tabView>

    <!-- Dialog cadastro fornecedor -->
    <p-dialog [(visible)]="dialogVisible" [header]="editando() ? 'Editar Fornecedor' : 'Novo Fornecedor'"
              [modal]="true" [style]="{width: '600px'}">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <div class="field">
          <label>Razão Social *</label>
          <input pInputText formControlName="razaoSocial">
        </div>
        <div class="row">
          <div class="field flex-1">
            <label>CNPJ *</label>
            <input pInputText formControlName="cnpj" placeholder="00.000.000/0000-00">
          </div>
          <div class="field flex-1">
            <label>Telefone</label>
            <input pInputText formControlName="telefone">
          </div>
        </div>
        <div class="field">
          <label>Email</label>
          <input pInputText formControlName="email">
        </div>
        <div class="dialog-footer">
          <button pButton type="button" label="Cancelar" class="p-button-text" (click)="dialogVisible = false"></button>
          <button pButton type="submit" label="Salvar" [loading]="salvando()" [disabled]="form.invalid"></button>
        </div>
      </form>
    </p-dialog>

    <!-- Dialog produtos vinculados -->
    <p-dialog [(visible)]="produtosDialogVisible" [header]="'Produtos: ' + (fornecedorAtivo?.razaoSocial || '')"
              [modal]="true" [style]="{width: '800px'}">
      <button pButton label="Vincular Ingrediente" icon="pi pi-plus" class="p-button-sm" (click)="abrirAdicionarProduto()"></button>
      <p-table [value]="produtos()" styleClass="p-datatable-sm" [style]="{'margin-top': '16px'}">
        <ng-template pTemplate="header">
          <tr><th>Ingrediente</th><th>Preço</th><th>Unidade</th><th></th></tr>
        </ng-template>
        <ng-template pTemplate="body" let-p>
          <tr>
            <td>{{ p.ingredienteNome }}</td>
            <td>{{ p.preco | currency:'BRL' }}</td>
            <td>{{ p.unidadeVenda }}</td>
            <td></td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="4" class="text-center">Nenhum produto vinculado</td></tr>
        </ng-template>
      </p-table>
    </p-dialog>

    <!-- Dialog vincular produto -->
    <p-dialog [(visible)]="addProdutoDialog" header="Vincular Ingrediente" [modal]="true" [style]="{width: '500px'}">
      <form [formGroup]="produtoForm" (ngSubmit)="salvarProduto()" class="form-grid">
        <div class="field">
          <label>Ingrediente *</label>
          <p-dropdown formControlName="ingredienteId" [options]="ingredientes()" optionLabel="nome"
                      optionValue="id" placeholder="Selecione" [style]="{width: '100%'}" [filter]="true"></p-dropdown>
        </div>
        <div class="row">
          <div class="field flex-1">
            <label>Preço *</label>
            <p-inputNumber formControlName="preco" mode="currency" currency="BRL" locale="pt-BR" [minFractionDigits]="2" [maxFractionDigits]="4"></p-inputNumber>
          </div>
          <div class="field flex-1">
            <label>Unidade de venda *</label>
            <p-dropdown formControlName="unidadeVenda" [options]="unidades" optionLabel="label" optionValue="value" [style]="{width: '100%'}"></p-dropdown>
          </div>
        </div>
        <div class="dialog-footer">
          <button pButton type="button" label="Cancelar" class="p-button-text" (click)="addProdutoDialog = false"></button>
          <button pButton type="submit" label="Vincular" [disabled]="produtoForm.invalid"></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .form-grid { display: flex; flex-direction: column; gap: 16px; }
    .row { display: flex; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 500; font-size: 0.875rem; }
    .flex-1 { flex: 1; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .text-center { text-align: center; padding: 24px; color: var(--text-secondary); }
    .cotacao-filtro { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; }
    .melhor-preco { background-color: #f0fdf4 !important; font-weight: 500; }
    .medal { font-size: 1.25rem; }
  `]
})
export class FornecedoresComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private confirmation = inject(ConfirmationService);
  private message = inject(MessageService);

  fornecedores = signal<FornecedorResponse[]>([]);
  ingredientes = signal<IngredienteResponse[]>([]);
  cotacao = signal<any[]>([]);
  produtos = signal<any[]>([]);
  loading = signal(false);
  dialogVisible = false;
  produtosDialogVisible = false;
  addProdutoDialog = false;
  editando = signal(false);
  salvando = signal(false);
  fornecedorAtivo: FornecedorResponse | null = null;
  ingredienteSelecionado: number | null = null;

  unidades = [
    { label: 'g', value: 'G' }, { label: 'ml', value: 'ML' },
    { label: 'un', value: 'UN' }, { label: 'kg', value: 'KG' }, { label: 'L', value: 'L' }
  ];

  form = this.fb.group({
    razaoSocial: ['', Validators.required],
    cnpj: ['', Validators.required],
    telefone: [''],
    email: ['']
  });

  produtoForm = this.fb.group({
    ingredienteId: [null as number | null, Validators.required],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    unidadeVenda: ['G', Validators.required]
  });

  ngOnInit() {
    this.carregar();
    this.adminService.listarIngredientes().subscribe(p => this.ingredientes.set(p.content));
  }

  carregar() {
    this.loading.set(true);
    this.adminService.listarFornecedores().subscribe({
      next: p => { this.fornecedores.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirNovo() {
    this.editando.set(false);
    this.form.reset();
    this.dialogVisible = true;
  }

  editar(f: FornecedorResponse) {
    this.editando.set(true);
    this.fornecedorAtivo = f;
    this.form.patchValue(f);
    this.dialogVisible = true;
  }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const data: any = this.form.value;
    const obs = this.editando() && this.fornecedorAtivo
      ? this.adminService.atualizarFornecedor(this.fornecedorAtivo.id, data)
      : this.adminService.criarFornecedor(data);
    obs.subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Salvo' });
        this.dialogVisible = false;
        this.salvando.set(false);
        this.carregar();
      },
      error: () => this.salvando.set(false)
    });
  }

  remover(f: FornecedorResponse) {
    this.confirmation.confirm({
      message: `Desativar "${f.razaoSocial}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.removerFornecedor(f.id).subscribe(() => {
          this.message.add({ severity: 'success', summary: 'Removido' });
          this.carregar();
        });
      }
    });
  }

  abrirProdutos(f: FornecedorResponse) {
    this.fornecedorAtivo = f;
    this.adminService.listarProdutosFornecedor(f.id).subscribe(p => this.produtos.set(p));
    this.produtosDialogVisible = true;
  }

  abrirAdicionarProduto() {
    this.produtoForm.reset({ unidadeVenda: 'G', preco: 0 });
    this.addProdutoDialog = true;
  }

  salvarProduto() {
    if (this.produtoForm.invalid || !this.fornecedorAtivo) return;
    this.adminService.adicionarProdutoFornecedor(this.fornecedorAtivo.id, this.produtoForm.value as any).subscribe(() => {
      this.message.add({ severity: 'success', summary: 'Vinculado' });
      this.addProdutoDialog = false;
      this.abrirProdutos(this.fornecedorAtivo!);
    });
  }

  carregarCotacao() {
    if (!this.ingredienteSelecionado) return;
    this.adminService.cotacaoIngrediente(this.ingredienteSelecionado).subscribe(c => this.cotacao.set(c));
  }
}
