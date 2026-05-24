import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { IngredienteResponse, PratoResponse, FichaTecnicaResponse, CustoResponse } from '@core/models/models';

@Component({
  selector: 'app-ficha-tecnica',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, ButtonModule,
    InputTextareaModule, InputNumberModule, DropdownModule, CardModule
  ],
  template: `
    <div class="page-header">
      <div>
        <button pButton icon="pi pi-arrow-left" class="p-button-text" routerLink="/admin/pratos"></button>
        <h1>Ficha Técnica: {{ prato()?.nome }}</h1>
      </div>
      <button pButton label="Salvar Ficha" icon="pi pi-save" (click)="salvar()" [loading]="salvando()" [disabled]="form.invalid"></button>
    </div>

    <div class="layout">
      <p-card header="Itens da Ficha" class="flex-grow">
        <form [formGroup]="form">
          <div formArrayName="itens">
            <div *ngFor="let item of itens.controls; let i = index" [formGroupName]="i" class="item-row">
              <div class="field flex-2">
                <label>Ingrediente</label>
                <p-dropdown formControlName="ingredienteId" [options]="ingredientes()" optionLabel="nome"
                            optionValue="id" placeholder="Selecione" [style]="{width: '100%'}" [filter]="true"></p-dropdown>
              </div>
              <div class="field" style="width: 120px">
                <label>Quantidade</label>
                <p-inputNumber formControlName="quantidade" [minFractionDigits]="0" [maxFractionDigits]="3"></p-inputNumber>
              </div>
              <div class="field" style="width: 100px">
                <label>Unidade</label>
                <p-dropdown formControlName="unidade" [options]="unidades" optionLabel="label"
                            optionValue="value" [style]="{width: '100%'}"></p-dropdown>
              </div>
              <div class="field" style="width: 110px">
                <label>Fator correção</label>
                <p-inputNumber formControlName="fatorCorrecao" [min]="1" [minFractionDigits]="2" [maxFractionDigits]="2"></p-inputNumber>
              </div>
              <button pButton icon="pi pi-trash" class="p-button-text p-button-danger remove-btn" (click)="removerItem(i)"></button>
            </div>
          </div>
          <button pButton type="button" label="Adicionar ingrediente" icon="pi pi-plus" class="p-button-outlined" (click)="adicionarItem()"></button>

          <div class="field" style="margin-top: 24px;">
            <label>Rendimento (porções) *</label>
            <p-inputNumber formControlName="rendimento" [min]="1" [style]="{width: '150px'}"></p-inputNumber>
          </div>
          <div class="field">
            <label>Modo de preparo</label>
            <textarea pInputTextarea formControlName="modoPreparo" rows="4"></textarea>
          </div>
        </form>
      </p-card>

      <div class="sidebar">
        <p-card header="Custo & Food Cost">
          <div *ngIf="custo() as c" class="custo-info">
            <div class="metric">
              <span class="label">Custo total</span>
              <span class="value">{{ c.custo | currency:'BRL' }}</span>
            </div>
            <div class="metric">
              <span class="label">Custo por porção</span>
              <span class="value">{{ c.custo | currency:'BRL' }}</span>
            </div>
            <div class="metric">
              <span class="label">Preço de venda</span>
              <span class="value">{{ c.precoVenda | currency:'BRL' }}</span>
            </div>
            <div class="metric food-cost" [class.verde]="c.foodCost <= 30" [class.amarelo]="c.foodCost > 30 && c.foodCost <= 35" [class.vermelho]="c.foodCost > 35">
              <span class="label">Food Cost</span>
              <span class="value-large">{{ c.foodCost | number:'1.1-1' }}%</span>
            </div>
            <div *ngIf="c.foodCost > 35" class="alert">
              <i class="pi pi-exclamation-triangle"></i>
              Food cost acima do recomendado (35%)
            </div>
          </div>
          <p *ngIf="!custo()" class="empty">Salve a ficha para calcular o custo.</p>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header > div { display: flex; align-items: center; gap: 12px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .layout { display: flex; gap: 24px; align-items: flex-start; }
    .flex-grow { flex: 1; }
    .sidebar { width: 320px; }
    .item-row { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 500; font-size: 0.75rem; color: var(--text-secondary); }
    .flex-2 { flex: 2; }
    .remove-btn { align-self: flex-end; }
    .custo-info { display: flex; flex-direction: column; gap: 14px; }
    .metric { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .metric:last-child { border-bottom: none; }
    .label { color: var(--text-secondary); font-size: 0.875rem; }
    .value { font-weight: 600; }
    .value-large { font-size: 1.5rem; font-weight: 700; }
    .food-cost.verde { color: var(--success); }
    .food-cost.amarelo { color: var(--warning); }
    .food-cost.vermelho { color: var(--danger); }
    .alert { padding: 12px; background: #fef2f2; color: var(--danger); border-radius: 8px; font-size: 0.875rem; display: flex; gap: 8px; align-items: center; }
    .empty { color: var(--text-secondary); text-align: center; padding: 24px 0; }
  `]
})
export class FichaTecnicaComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private message = inject(MessageService);

  pratoId!: number;
  prato = signal<PratoResponse | null>(null);
  ingredientes = signal<IngredienteResponse[]>([]);
  custo = signal<CustoResponse | null>(null);
  salvando = signal(false);

  unidades = [
    { label: 'g', value: 'G' }, { label: 'ml', value: 'ML' },
    { label: 'un', value: 'UN' }, { label: 'kg', value: 'KG' }, { label: 'L', value: 'L' }
  ];

  form = this.fb.group({
    itens: this.fb.array([]),
    rendimento: [1, [Validators.required, Validators.min(1)]],
    modoPreparo: ['']
  });

  get itens(): FormArray { return this.form.get('itens') as FormArray; }

  ngOnInit() {
    this.pratoId = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.buscarPrato(this.pratoId).subscribe(p => this.prato.set(p));
    this.adminService.listarIngredientes().subscribe(p => this.ingredientes.set(p.content));
    this.carregarFicha();
    this.carregarCusto();
  }

  carregarFicha() {
    this.adminService.buscarFichaTecnica(this.pratoId).subscribe({
      next: (ficha: FichaTecnicaResponse) => {
        this.form.patchValue({ rendimento: ficha.rendimento, modoPreparo: ficha.modoPreparo });
        this.itens.clear();
        ficha.itens?.forEach(it => this.itens.push(this.criarItem(it.ingredienteId, it.quantidade, it.unidade, it.fatorCorrecao)));
      },
      error: () => { /* ficha ainda nao criada */ }
    });
  }

  carregarCusto() {
    this.adminService.calcularCustoPrato(this.pratoId).subscribe({
      next: c => this.custo.set(c),
      error: () => { /* sem ficha ainda */ }
    });
  }

  criarItem(ingredienteId: number | null = null, quantidade = 0, unidade = 'G', fatorCorrecao = 1.0): FormGroup {
    return this.fb.group({
      ingredienteId: [ingredienteId, Validators.required],
      quantidade: [quantidade, [Validators.required, Validators.min(0.001)]],
      unidade: [unidade, Validators.required],
      fatorCorrecao: [fatorCorrecao, [Validators.required, Validators.min(1)]]
    });
  }

  adicionarItem() { this.itens.push(this.criarItem()); }
  removerItem(i: number) { this.itens.removeAt(i); }

  salvar() {
    if (this.form.invalid || this.itens.length === 0) {
      this.message.add({ severity: 'warn', summary: 'Atenção', detail: 'Adicione ao menos 1 ingrediente' });
      return;
    }
    this.salvando.set(true);
    const data: any = this.form.value;
    this.adminService.salvarFichaTecnica(this.pratoId, data).subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Salvo', detail: 'Ficha salva' });
        this.salvando.set(false);
        this.carregarCusto();
      },
      error: () => this.salvando.set(false)
    });
  }
}
